#!/usr/bin/env bash
# Helpers for the append-only R2 web deploy.
# The release workflow never deletes objects and does not apply CORS.
# Apply infra/r2-cors.json out of band (see the release checklist).
set -euo pipefail

CACHE_CONTROL='public, max-age=31536000, immutable'

usage() {
  echo "usage: r2-web-release.sh plan|assert-absent|sri" >&2
  exit 2
}

quote() {
  local value=$1
  value=${value//\\/\\\\}
  value=${value//\"/\\\"}
  printf '"%s"' "$value"
}

content_type() {
  local file=$1
  local ext="${file##*.}"
  ext="${ext,,}"
  case "$ext" in
    css) printf 'text/css' ;;
    js) printf 'text/javascript' ;;
    woff2) printf 'font/woff2' ;;
    woff) printf 'font/woff' ;;
    ttf) printf 'font/ttf' ;;
    otf) printf 'font/otf' ;;
    eot) printf 'application/vnd.ms-fontobject' ;;
    *)
      echo "::error::no Content-Type mapping for ${file}" >&2
      return 1
      ;;
  esac
}

require_bucket() {
  if [ -z "${R2_BUCKET:-}" ] || [ "$R2_BUCKET" = "TBD" ]; then
    echo "::error::R2_BUCKET is still TBD. Set it in .github/workflows/publish.yml before releasing." >&2
    exit 1
  fi
  if [ -z "${VERSION_PREFIX:-}" ]; then
    echo "::error::VERSION_PREFIX is required" >&2
    exit 1
  fi
}

emit_put() {
  local bucket=$1 prefix=$2 rel=$3 file=$4 ctype=$5
  printf 'r2 object put %s --file=%s --content-type=%s --cache-control=%s --remote\n' \
    "$(quote "${bucket}/${prefix}/${rel}")" \
    "$(quote "$file")" \
    "$(quote "$ctype")" \
    "$(quote "$CACHE_CONTROL")"
}

plan() {
  require_bucket
  local root="${WEB_ROOT:-web}"
  local css="${root}/x-ui.css"
  local theme="${root}/theme-script.js"
  local fonts="${root}/fonts"
  local file rel ctype found=0

  if [ ! -f "$css" ]; then
    echo "::error::missing ${css}" >&2
    exit 1
  fi
  if [ ! -f "$theme" ]; then
    echo "::error::missing ${theme}" >&2
    exit 1
  fi
  if [ ! -d "$fonts" ]; then
    echo "::error::missing ${fonts}" >&2
    exit 1
  fi

  while IFS= read -r -d '' file; do
    found=1
    rel="${file#"${root}/"}"
    ctype="$(content_type "$file")"
    emit_put "$R2_BUCKET" "$VERSION_PREFIX" "$rel" "$file" "$ctype"
  done < <(find "$fonts" -type f -print0 | sort -z)

  if [ "$found" -eq 0 ]; then
    echo "::error::no font files under ${fonts}" >&2
    exit 1
  fi

  emit_put "$R2_BUCKET" "$VERSION_PREFIX" "theme-script.js" "$theme" "text/javascript"
  # x-ui.css is last so the prefix guard stays clear until every other object is up.
  emit_put "$R2_BUCKET" "$VERSION_PREFIX" "x-ui.css" "$css" "text/css"
}

assert_absent() {
  require_bucket
  local out err status
  out="$(mktemp)"
  err="$(mktemp)"
  set +e
  if [ -n "${WRANGLER_BIN:-}" ]; then
    "$WRANGLER_BIN" r2 object get "${R2_BUCKET}/${VERSION_PREFIX}/x-ui.css" --file /tmp/r2-prefix-probe.css --remote >"$out" 2>"$err"
  else
    npx wrangler r2 object get "${R2_BUCKET}/${VERSION_PREFIX}/x-ui.css" --file /tmp/r2-prefix-probe.css --remote >"$out" 2>"$err"
  fi
  status=$?
  set -e
  if [ "$status" -eq 0 ]; then
    echo "::error::${VERSION_PREFIX}/x-ui.css already exists in ${R2_BUCKET}; refusing to upload" >&2
    exit 1
  fi
  if grep -q "The specified key does not exist" "$err" "$out"; then
    echo "Prefix ${VERSION_PREFIX}/ has no x-ui.css."
    exit 0
  fi
  echo "::error::Could not confirm that ${VERSION_PREFIX}/x-ui.css is absent (wrangler exit ${status})." >&2
  cat "$out" "$err" >&2
  exit 1
}

sri() {
  local css="${WEB_ROOT:-web}/x-ui.css"
  local hash
  if [ ! -f "$css" ]; then
    echo "::error::missing ${css}" >&2
    exit 1
  fi
  hash="$(openssl dgst -sha384 -binary "$css" | openssl base64 -A)"
  printf 'sha384-%s\n' "$hash"
}

case "${1:-}" in
  plan) plan ;;
  assert-absent) assert_absent ;;
  sri) sri ;;
  *) usage ;;
esac
