#!/usr/bin/env bash
# Scripted checks for the R2 sentinel gate, empty R2_BUCKET, and the tag regex.
set -euo pipefail
shopt -s inherit_errexit

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT="$ROOT/scripts/r2-web-release.sh"
WF="$ROOT/.github/workflows/publish.yml"
DOC="$ROOT/docs/RELEASE.md"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}
pass() {
  echo "PASS: $*"
}

bash -n "$SCRIPT"

literal_count="$(grep -c '_xui-sentinel.txt' "$SCRIPT")"
if [ "$literal_count" -ne 1 ]; then
  fail "scripts/r2-web-release.sh should name the sentinel once (found ${literal_count})"
fi
grep -q "^SENTINEL_KEY='_xui-sentinel.txt'$" "$SCRIPT" || fail "SENTINEL_KEY assignment missing"
sentinel="$(sed -n "s/^SENTINEL_KEY='\\(.*\\)'$/\\1/p" "$SCRIPT")"
[ "$sentinel" = "_xui-sentinel.txt" ] || fail "unexpected sentinel name"

vars_count="$(grep -c 'vars.R2_BUCKET' "$WF")"
if [ "$vars_count" -ne 2 ]; then
  fail "publish.yml should read vars.R2_BUCKET in r2-preflight and deploy-web (found ${vars_count})"
fi
if grep -n 'R2_BUCKET: TBD' "$WF"; then
  fail "R2_BUCKET TBD placeholder is still in the workflow"
fi
grep -Fq '20[0-9]{2}' "$WF" || fail "tag year regex was not tightened"

version_ok() {
  [[ "$1" =~ ^20[0-9]{2}\.(1[0-2]|[1-9])\.[1-9][0-9]*$ ]]
}
version_ok "2026.10.1" || fail "2026.10.1 should match"
version_ok "2026.9.1" || fail "2026.9.1 should match"
version_ok "2000.1.1" || fail "2000.1.1 should match"
version_ok "2099.12.10" || fail "2099.12.10 should match"
if version_ok "1999.1.1"; then fail "1999.1.1 should not match"; fi
if version_ok "2100.1.1"; then fail "2100.1.1 should not match"; fi
if version_ok "2026.09.1"; then fail "2026.09.1 should not match"; fi
if version_ok "0.1.8"; then fail "0.1.8 should not match"; fi
if version_ok "2026.10.0"; then fail "2026.10.0 should not match"; fi
pass "version regex"

grep -q '_xui-sentinel.txt' "$DOC" || fail "docs/RELEASE.md missing sentinel"
grep -Fq 'vars.R2_BUCKET' "$DOC" || fail "docs/RELEASE.md missing vars.R2_BUCKET"
grep -Fq 'wrangler r2 object put' "$DOC" || fail "docs/RELEASE.md missing sentinel upload command"
grep -Fq 'tag-on-main' "$DOC" || fail "docs/RELEASE.md missing tag-ruleset reason"
grep -Fq 'any branch can name' "$DOC" || fail "docs/RELEASE.md missing environment reason"
grep -Fq 'repository secrets' "$DOC" || fail "docs/RELEASE.md missing repo-secret warning"
pass "release doc"

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT
tree="$workdir/web"
mkdir -p "$tree/fonts"
printf 'css' > "$tree/x-ui.css"
printf 'theme' > "$tree/theme-script.js"
printf 'runtime' > "$tree/xui.js"
printf '{"ok":true}' > "$tree/manifest.json"
printf 'font' > "$tree/fonts/a.woff2"

log="$workdir/wrangler.log"
puts="$workdir/puts"
stdout="$workdir/stdout"
stderr="$workdir/stderr"
mock="$workdir/mock-wrangler"
bomb="$workdir/bomb"
cat > "$bomb" << 'EOF'
#!/bin/bash
echo "wrangler should not have been called" >&2
exit 99
EOF
cat > "$mock" << 'EOF'
#!/bin/bash
set -euo pipefail
echo "$*" >> "$MOCK_LOG"
mode=""
path=""
file=""
prev=""
for arg in "$@"; do
  case "$prev" in
    --file)
      file=$arg
      prev=""
      continue
      ;;
    --content-type|--cache-control)
      prev=""
      continue
      ;;
  esac
  case "$arg" in
    get|put) mode=$arg ;;
    --file|--content-type|--cache-control) prev=$arg; continue ;;
  esac
  if [[ "$arg" == */* && "$arg" != --* && -z "$path" ]]; then
    path=$arg
  fi
done
key="${path#*/}"
if [ "$key" = "$EXPECT_SENTINEL" ]; then
  if [ "${MOCK_SENTINEL:-ok}" = "fail" ]; then
    echo "The specified key does not exist." >&2
    exit 1
  fi
  printf 'sentinel' > "$file"
  exit 0
fi
if [[ "$key" == *"$EXPECT_SENTINEL"* ]]; then
  echo "sentinel is not at the bucket root: ${key}" >&2
  exit 3
fi
case "$mode" in
  get)
    case "${MOCK_RELEASE:-missing}" in
      missing)
        echo "The specified key does not exist." >&2
        exit 1
        ;;
      http403)
        echo "Failed to fetch /accounts/0/r2/buckets/b/objects/${key} - 403: Forbidden;" >&2
        exit 1
        ;;
      match)
        rel="${key#*/}"
        if [ ! -f "${MOCK_TREE}/${rel}" ]; then
          echo "no local file for ${rel}" >&2
          exit 2
        fi
        cp "${MOCK_TREE}/${rel}" "$file"
        exit 0
        ;;
      differ)
        printf 'different\n' > "$file"
        exit 0
        ;;
      *)
        echo "unknown release state" >&2
        exit 2
        ;;
    esac
    ;;
  put)
    printf '%s\n' "$key" >> "$MOCK_PUTS"
    exit 0
    ;;
  *)
    echo "unknown wrangler mode" >&2
    exit 2
    ;;
esac
EOF
chmod +x "$bomb" "$mock"

run_release() {
  local cmd=$1
  : > "$log"
  rm -f "$puts"
  set +e
  WEB_ROOT="$tree" \
    R2_BUCKET="${bucket}" \
    VERSION_PREFIX=x-ui-v2026.10.1 \
    WRANGLER_BIN="$mock" \
    MOCK_LOG="$log" \
    MOCK_PUTS="$puts" \
    MOCK_SENTINEL="$sentinel_mode" \
    EXPECT_SENTINEL="$sentinel" \
    MOCK_RELEASE="$release_mode" \
    MOCK_TREE="$tree" \
    bash "$SCRIPT" "$cmd" >"$stdout" 2>"$stderr"
  status=$?
  set -e
}

bucket="test-bucket"
sentinel_mode="fail"
release_mode="missing"
run_release preflight
if [ "$status" -eq 0 ]; then
  fail "wrong bucket or account (sentinel 404) should fail preflight"
fi
grep -Fq "Could not read ${bucket}/${sentinel}" "$stderr" || fail "preflight should name the sentinel"
grep -Fq 'CLOUDFLARE_ACCOUNT_ID' "$stderr" || fail "preflight should mention the account id"
if grep -Fq 'free to continue' "$stdout"; then
  fail "preflight passed after a sentinel 404"
fi
if grep -Fq 'x-ui.css' "$log"; then
  fail "preflight queried a release key after the sentinel read failed"
fi
grep -Fq "${bucket}/${sentinel}" "$log" || fail "preflight did not read the bucket-root sentinel"
pass "sentinel 404 fails closed"

sentinel_mode="ok"
release_mode="missing"
run_release preflight
if [ "$status" -ne 0 ]; then
  cat "$stderr" >&2
  fail "preflight should continue when the sentinel exists and release keys are missing"
fi
grep -Fq 'free to continue' "$stdout" || fail "missing release keys should be allowed after the sentinel"
first="$(head -n 1 "$log")"
case "$first" in
  *"object get ${bucket}/${sentinel}"*) ;;
  *) fail "first R2 read was not the sentinel: ${first}" ;;
esac
pass "sentinel success then release-key 404 is missing"

release_mode="http403"
run_release preflight
if [ "$status" -eq 0 ]; then
  fail "403 after a good sentinel should still fail"
fi
grep -Fq '403' "$stderr" || fail "403 body was not surfaced"
pass "403 is not missing"

# An inherited SENTINEL_OK=1 must not skip the bucket-root read.
sentinel_mode="fail"
release_mode="missing"
SENTINEL_OK=1 run_release preflight
if [ "$status" -eq 0 ]; then
  fail "inherited SENTINEL_OK=1 skipped the sentinel check"
fi
grep -Fq "${bucket}/${sentinel}" "$log" || fail "inherited SENTINEL_OK=1 did not read the sentinel"
pass "inherited SENTINEL_OK does not skip the sentinel"
unset SENTINEL_OK

# Match and differ run only after the bucket-root sentinel read succeeds.
sentinel_read_first() {
  local first
  first="$(head -n 1 "$log")"
  case "$first" in
    *"object get ${bucket}/${sentinel}"*) ;;
    *) fail "release-key check ran before the sentinel read: ${first}" ;;
  esac
}

sentinel_mode="ok"
release_mode="match"
run_release preflight
sentinel_read_first
if [ "$status" -ne 0 ]; then
  cat "$stderr" >&2
  fail "matching css and manifest should pass preflight"
fi
grep -Fq 'idempotent re-run' "$stdout" || fail "match should be an idempotent re-run"
if [ -s "$puts" ]; then
  fail "preflight match should not put"
fi
pass "preflight match skips after the sentinel read"

release_mode="differ"
run_release preflight
sentinel_read_first
if [ "$status" -eq 0 ]; then
  fail "differing css or manifest should fail preflight"
fi
grep -Fq 'byte-identical' "$stderr" || fail "differ should refuse before upload"
if [ -s "$puts" ]; then
  fail "preflight differ should not put"
fi
pass "preflight differ fails after the sentinel read"

release_mode="match"
run_release upload
sentinel_read_first
if [ "$status" -ne 0 ]; then
  cat "$stderr" >&2
  fail "upload should skip when every object matches"
fi
grep -Fq 'sha256 matches' "$stdout" || fail "upload match should skip"
if [ -s "$puts" ]; then
  fail "upload match should not put"
fi
pass "upload match skips after the sentinel read"

release_mode="differ"
run_release upload
sentinel_read_first
if [ "$status" -eq 0 ]; then
  fail "upload should fail when the remote bytes differ"
fi
if [ -s "$puts" ]; then
  fail "upload differ should fail before any put"
fi
pass "upload differ fails after the sentinel read"

sentinel_mode="fail"
release_mode="missing"
run_release upload
if [ "$status" -eq 0 ]; then
  fail "upload should stop when the sentinel cannot be read"
fi
if [ -s "$puts" ]; then
  fail "upload put objects without a sentinel"
fi
pass "upload stops before any put"

sentinel_mode="ok"
run_release upload
if [ "$status" -ne 0 ]; then
  cat "$stderr" >&2
  fail "upload should proceed after the sentinel read"
fi
grep -Fq "x-ui-v2026.10.1/x-ui.css" "$puts" || fail "upload did not put x-ui.css"
sent_line="$(grep -n "${sentinel}" "$log" | head -n 1 | cut -d: -f1)"
put_line="$(grep -n 'object put' "$log" | head -n 1 | cut -d: -f1)"
if [ -z "$sent_line" ] || [ -z "$put_line" ] || [ "$sent_line" -ge "$put_line" ]; then
  fail "sentinel was not read before the first put"
fi
pass "upload reads the sentinel before putting"

if WEB_ROOT="$tree" R2_BUCKET="" VERSION_PREFIX=x-ui-v2026.10.1 WRANGLER_BIN="$bomb" \
  bash "$SCRIPT" preflight >"$stdout" 2>"$stderr"; then
  fail "empty R2_BUCKET should fail"
fi
grep -Fq 'vars.R2_BUCKET' "$stderr" || fail "empty R2_BUCKET message should name vars.R2_BUCKET"
pass "empty R2_BUCKET fails"

if WEB_ROOT="$tree" R2_BUCKET="TBD" VERSION_PREFIX=x-ui-v2026.10.1 WRANGLER_BIN="$bomb" \
  bash "$SCRIPT" preflight >"$stdout" 2>"$stderr"; then
  fail "R2_BUCKET=TBD should fail"
fi
pass "TBD bucket fails"

echo "all checks passed"
