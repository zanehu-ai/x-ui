#!/usr/bin/env bash
# Append-only R2 upload of the web/dist tree.
# This script never deletes objects and does not apply CORS.
set -euo pipefail
shopt -s inherit_errexit

CACHE_CONTROL='public, max-age=31536000, immutable'
# Bucket root, outside any x-ui-v* prefix. Wrangler 4.147.0 reports every
# HTTP 404 as a missing key, including a wrong bucket or account.
SENTINEL_KEY='_xui-sentinel.txt'

usage() {
  echo "usage: r2-web-release.sh require-build-web|check-outputs|preflight|upload|sri" >&2
  exit 2
}

web_root() {
  printf '%s' "${WEB_ROOT:-web/dist}"
}

content_type() {
  local file=$1
  local ext="${file##*.}"
  ext="${ext,,}"
  case "$ext" in
    css) printf 'text/css; charset=utf-8' ;;
    js) printf 'text/javascript; charset=utf-8' ;;
    json) printf 'application/json; charset=utf-8' ;;
    woff) printf 'font/woff' ;;
    woff2) printf 'font/woff2' ;;
    ttf) printf 'font/ttf' ;;
    otf) printf 'font/otf' ;;
    *)
      echo "::error::no Content-Type mapping for ${file}" >&2
      return 1
      ;;
  esac
}

allowed_rel() {
  local rel=$1
  local ext
  case "$rel" in
    x-ui.css|theme-script.js|xui.js|manifest.json)
      return 0
      ;;
    fonts/*)
      ext="${rel##*.}"
      ext="${ext,,}"
      case "$ext" in
        woff2|woff|ttf|otf) return 0 ;;
      esac
      return 1
      ;;
    *)
      return 1
      ;;
  esac
}

require_bucket() {
  if [ -z "${R2_BUCKET:-}" ] || [ "$R2_BUCKET" = "TBD" ]; then
    echo "::error::R2_BUCKET is empty. Set the GitHub variable R2_BUCKET (repository variable or release environment variable). The workflow reads vars.R2_BUCKET. See docs/RELEASE.md." >&2
    exit 1
  fi
  if [ -z "${VERSION_PREFIX:-}" ]; then
    echo "::error::VERSION_PREFIX is required" >&2
    exit 1
  fi
}

require_build_web() {
  if ! node -e "const s=require('./package.json').scripts||{}; if(!s['build:web']) process.exit(1)"; then
    echo "::error::npm script build:web is missing. This release depends on Platform Engineer's tokens PR, which adds web/ sources and build:web." >&2
    exit 1
  fi
}

# Write NUL-delimited find output to dest and fail if find fails.
# Process substitution would hide find's exit status.
find_print0() {
  local dest=$1
  local path=$2
  shift 2
  local status=0
  set +e
  find "$path" "$@" -print0 | sort -z > "$dest"
  status=$?
  set -e
  if [ "$status" -ne 0 ]; then
    echo "::error::failed to list ${path}" >&2
    return 1
  fi
}

check_outputs() {
  local root file rel missing=0 extras=0 fonts=0 list
  root="$(web_root)"
  if [ ! -d "$root" ]; then
    echo "::error::missing ${root} after build:web" >&2
    exit 1
  fi
  list="$(mktemp)"
  find_print0 "$list" "$root" ! -type d
  while IFS= read -r -d '' file; do
    if [ -L "$file" ] || [ ! -f "$file" ]; then
      echo "::error::${file} is not a regular file" >&2
      extras=1
      continue
    fi
    rel="$(rel_key "$file")"
    if allowed_rel "$rel"; then
      case "$rel" in
        fonts/*) fonts=$((fonts + 1)) ;;
      esac
    else
      echo "::error::${root}/${rel} is not on the R2 upload allowlist" >&2
      extras=1
    fi
  done < "$list"
  rm -f "$list"
  local required
  for required in x-ui.css theme-script.js xui.js manifest.json; do
    if [ ! -f "${root}/${required}" ] || [ -L "${root}/${required}" ]; then
      echo "::error::missing ${root}/${required} after build:web" >&2
      missing=1
    fi
  done
  if [ "$fonts" -eq 0 ]; then
    echo "::error::missing at least one woff2, woff, ttf, or otf file under ${root}/fonts/" >&2
    missing=1
  fi
  if [ "$missing" -ne 0 ] || [ "$extras" -ne 0 ]; then
    exit 1
  fi
}

# NUL-delimited. Fonts, then theme-script.js, then xui.js, then manifest.json, then x-ui.css.
list_upload_order() {
  local root list file bad=0
  root="$(web_root)"
  list="$(mktemp)"
  find_print0 "$list" "${root}/fonts" -type f
  while IFS= read -r -d '' file; do
    if [ -L "$file" ] || [ ! -f "$file" ]; then
      echo "::error::${file} is not a regular file" >&2
      bad=1
      break
    fi
    printf '%s\0' "$file"
  done < "$list"
  rm -f "$list"
  if [ "$bad" -ne 0 ]; then
    return 1
  fi
  printf '%s\0' "${root}/theme-script.js"
  printf '%s\0' "${root}/xui.js"
  printf '%s\0' "${root}/manifest.json"
  printf '%s\0' "${root}/x-ui.css"
}

rel_key() {
  local root
  root="$(web_root)"
  printf '%s' "${1#"${root}/"}"
}

sha256_file() {
  sha256sum "$1" | awk '{print $1}'
}

wrangler() {
  if [ -n "${WRANGLER_BIN:-}" ]; then
    "$WRANGLER_BIN" "$@"
  else
    npx --no-install wrangler "$@"
  fi
}

# A release-key 404 is "missing" only after require_sentinel succeeds.
# Until then, wrangler 4.147.0 cannot tell a missing key from a wrong bucket
# or a wrong CLOUDFLARE_ACCOUNT_ID (both are HTTP 404).
is_missing_object() {
  local log=$1
  if [ "${SENTINEL_OK:-}" != 1 ]; then
    return 1
  fi
  if grep -Eq 'Failed to fetch .+ - (400|401|403|409|412|429|500|502|503|504):' "$log"; then
    return 1
  fi
  if grep -Fq 'The specified key does not exist.' "$log"; then
    return 0
  fi
  if grep -Eq 'Failed to fetch .+ - 404:' "$log"; then
    return 0
  fi
  if grep -Fq 'NoSuchKey' "$log"; then
    return 0
  fi
  if grep -Eq '"code"[[:space:]]*:[[:space:]]*10007([^0-9]|$)' "$log"; then
    return 0
  fi
  return 1
}

# wrangler 4.147.0 `r2 object get`:
# fetchR2Objects returns null only on HTTP 404. The command then throws
# UserError "The specified key does not exist." Any other status throws
# APIError "Failed to fetch <resource> - <status>: <statusText>;" and may
# attach errors[0].code. 401/403/400/409/412/429/5xx are not a missing key.
# The destination file is created before the fetch, so hash it only on exit 0.
# Prints missing, match, or differ. Unexpected wrangler errors return 1.
object_state() {
  local rel=$1
  local localfile=$2
  if [ "${SENTINEL_OK:-}" != 1 ]; then
    echo "::error::Refusing to read ${VERSION_PREFIX}/${rel} before ${SENTINEL_KEY} has been read from the bucket root." >&2
    return 1
  fi
  local tmp out err status local_hash remote_hash combined
  tmp="$(mktemp)"
  out="$(mktemp)"
  err="$(mktemp)"
  combined="$(mktemp)"
  set +e
  wrangler r2 object get "${R2_BUCKET}/${VERSION_PREFIX}/${rel}" --file "$tmp" --remote >"$out" 2>"$err"
  status=$?
  set -e
  cat "$out" "$err" > "$combined"
  if [ "$status" -eq 0 ]; then
    local_hash="$(sha256_file "$localfile")"
    remote_hash="$(sha256_file "$tmp")"
    rm -f "$tmp" "$out" "$err" "$combined"
    if [ "$local_hash" = "$remote_hash" ]; then
      printf 'match\n'
    else
      printf 'differ\n'
    fi
    return 0
  fi
  if is_missing_object "$combined"; then
    rm -f "$tmp" "$out" "$err" "$combined"
    printf 'missing\n'
    return 0
  fi
  echo "::error::Could not read ${VERSION_PREFIX}/${rel} (wrangler exit ${status})." >&2
  cat "$combined" >&2
  rm -f "$tmp" "$out" "$err" "$combined"
  return 1
}

# GET ${R2_BUCKET}/${SENTINEL_KEY}. Fail closed unless wrangler exits 0.
# A missing sentinel, a mistyped bucket, and a wrong account id all look
# like "The specified key does not exist."
require_sentinel() {
  require_bucket
  if [ "${SENTINEL_OK:-}" = 1 ]; then
    return 0
  fi
  local tmp out err status combined
  tmp="$(mktemp)"
  out="$(mktemp)"
  err="$(mktemp)"
  combined="$(mktemp)"
  set +e
  wrangler r2 object get "${R2_BUCKET}/${SENTINEL_KEY}" --file "$tmp" --remote >"$out" 2>"$err"
  status=$?
  set -e
  cat "$out" "$err" > "$combined"
  rm -f "$tmp" "$out" "$err"
  if [ "$status" -ne 0 ]; then
    echo "::error::Could not read ${R2_BUCKET}/${SENTINEL_KEY}. Refusing to treat a release-key 404 as missing. Wrangler 4.147.0 returns 'The specified key does not exist.' for a wrong R2_BUCKET or a wrong CLOUDFLARE_ACCOUNT_ID as well as a missing key. Create ${SENTINEL_KEY} at the bucket root, outside any x-ui-v* prefix. See docs/RELEASE.md." >&2
    cat "$combined" >&2
    rm -f "$combined"
    exit 1
  fi
  rm -f "$combined"
  SENTINEL_OK=1
}

preflight() {
  require_sentinel
  check_outputs
  local root css_state manifest_state
  root="$(web_root)"
  css_state="$(object_state "x-ui.css" "${root}/x-ui.css")"
  manifest_state="$(object_state "manifest.json" "${root}/manifest.json")"
  if [ "$css_state" = "differ" ] || [ "$manifest_state" = "differ" ]; then
    echo "::error::Refusing to upload. ${VERSION_PREFIX}/x-ui.css is ${css_state} and manifest.json is ${manifest_state}. An existing object must be byte-identical." >&2
    exit 1
  fi
  if [ "$css_state" = "match" ] && [ "$manifest_state" = "match" ]; then
    echo "x-ui.css and manifest.json match the local build; idempotent re-run."
  else
    echo "Release prefix is free to continue (x-ui.css=${css_state}, manifest.json=${manifest_state})."
  fi
}

upload_one() {
  local file=$1
  local rel ctype state
  rel="$(rel_key "$file")"
  ctype="$(content_type "$file")"
  state="$(object_state "$rel" "$file")"
  case "$state" in
    match)
      echo "skip ${rel}; sha256 matches"
      ;;
    missing)
      echo "upload ${rel} (${ctype})"
      wrangler r2 object put "${R2_BUCKET}/${VERSION_PREFIX}/${rel}" \
        --file "$file" \
        --content-type "$ctype" \
        --cache-control "$CACHE_CONTROL" \
        --remote
      ;;
    differ)
      echo "::error::${VERSION_PREFIX}/${rel} exists and its sha256 does not match the local file" >&2
      exit 1
      ;;
    *)
      echo "::error::unexpected state '${state}' for ${rel}" >&2
      exit 1
      ;;
  esac
}

upload() {
  require_sentinel
  preflight
  local list file
  list="$(mktemp)"
  list_upload_order > "$list"
  while IFS= read -r -d '' file; do
    upload_one "$file"
  done < "$list"
  rm -f "$list"
}

sri() {
  local root css theme runtime css_hash theme_hash runtime_hash
  root="$(web_root)"
  css="${root}/x-ui.css"
  theme="${root}/theme-script.js"
  runtime="${root}/xui.js"
  if [ ! -f "$css" ] || [ ! -f "$theme" ] || [ ! -f "$runtime" ]; then
    echo "::error::missing ${css}, ${theme}, or ${runtime}" >&2
    exit 1
  fi
  css_hash="$(openssl dgst -sha384 -binary "$css" | openssl base64 -A)"
  theme_hash="$(openssl dgst -sha384 -binary "$theme" | openssl base64 -A)"
  runtime_hash="$(openssl dgst -sha384 -binary "$runtime" | openssl base64 -A)"
  printf 'x-ui.css sha384-%s\n' "$css_hash"
  printf 'theme-script.js sha384-%s\n' "$theme_hash"
  printf 'xui.js sha384-%s\n' "$runtime_hash"
}

case "${1:-}" in
  require-build-web) require_build_web ;;
  check-outputs) check_outputs ;;
  preflight) preflight ;;
  upload) upload ;;
  sri) sri ;;
  *) usage ;;
esac
