#!/usr/bin/env bash
set -Eeuo pipefail

# Canonical, idempotent Anything Analyzer Phase-1 bootstrap for the user's i9ES host.
# This script intentionally does not change the system-wide proxy or browser profile.

EXPECTED_HOST_RE='^(i9es|i9es-home)$'
ROOT='/mnt/SERVE/anything-analyzer'
BIN="$ROOT/bin"
SRC_ROOT="$ROOT/src"
SRC="$SRC_ROOT/anything-analyzer"
STATE="$ROOT/state"
LOGS="$ROOT/logs"
WORKSPACES="$ROOT/workspaces"
TOOLS="$ROOT/tools"
RECEIPTS="$ROOT/receipts"

AA_COMMIT='e3bad7330efaa2b390fdf5899e458e24bf4ad068'
AA_VERSION='3.6.62'
AA_APPIMAGE='Anything-Analyzer-3.6.62.AppImage'
AA_APPIMAGE_URL='https://github.com/Mouseww/anything-analyzer/releases/download/v3.6.61/Anything-Analyzer-3.6.62.AppImage'
AA_APPIMAGE_SHA256='2ab9a8713da3524212a7c9560e23dc24e8702de9360bf4c81b745f4f246a917b'
AA_REPO='https://github.com/Mouseww/anything-analyzer.git'
MCP_PORT='23816'
MITM_PORT='8888'

host="$(hostname)"
host_lc="$(printf '%s' "$host" | tr '[:upper:]' '[:lower:]')"
if ! [[ "$host_lc" =~ $EXPECTED_HOST_RE ]]; then
  echo "REFUSING_HOST=$host" >&2
  echo 'Expected i9ES/i9es-home; no mutation performed.' >&2
  exit 42
fi

if [[ ! -d /mnt/SERVE || ! -w /mnt/SERVE ]]; then
  echo 'ERROR: /mnt/SERVE must exist and be writable.' >&2
  exit 43
fi

mkdir -p "$BIN" "$SRC_ROOT" "$STATE" "$LOGS" "$WORKSPACES" "$TOOLS" "$RECEIPTS"

exec > >(tee -a "$LOGS/phase1-bootstrap.log") 2>&1

echo "=== TF Anything Analyzer Phase 1 bootstrap @ $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "HOST=$host USER=$(id -un) ROOT=$ROOT"

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "MISSING_REQUIRED_COMMAND=$cmd" >&2
    return 1
  fi
}

for c in curl sha256sum git python3; do require_cmd "$c"; done

# ---- Official AppImage ----
app="$BIN/$AA_APPIMAGE"
if [[ ! -f "$app" ]]; then
  tmp="$app.part.$$"
  rm -f "$tmp"
  echo "Downloading $AA_APPIMAGE"
  curl -fL --retry 4 --retry-all-errors --connect-timeout 15 -o "$tmp" "$AA_APPIMAGE_URL"
  mv -f "$tmp" "$app"
fi

actual_sha="$(sha256sum "$app" | awk '{print $1}')"
if [[ "$actual_sha" != "$AA_APPIMAGE_SHA256" ]]; then
  echo "APPIMAGE_SHA256_MISMATCH expected=$AA_APPIMAGE_SHA256 actual=$actual_sha" >&2
  exit 44
fi
chmod 0755 "$app"
printf '%s  %s\n' "$actual_sha" "$app" > "$RECEIPTS/PHASE1_APPIMAGE_SHA256.txt"

# ---- Editable pinned source ----
if [[ ! -d "$SRC/.git" ]]; then
  rm -rf "$SRC"
  git clone "$AA_REPO" "$SRC"
fi

git -C "$SRC" fetch --prune origin
if ! git -C "$SRC" cat-file -e "$AA_COMMIT^{commit}" 2>/dev/null; then
  git -C "$SRC" fetch origin "$AA_COMMIT"
fi
git -C "$SRC" checkout --detach "$AA_COMMIT"
source_commit="$(git -C "$SRC" rev-parse HEAD)"
[[ "$source_commit" == "$AA_COMMIT" ]] || { echo "SOURCE_COMMIT_MISMATCH=$source_commit" >&2; exit 45; }
printf 'commit=%s\nrepo=%s\n' "$source_commit" "$AA_REPO" > "$RECEIPTS/PHASE1_SOURCE_COMMIT.txt"

# ---- Isolated Node/pnpm state on /mnt/SERVE ----
export XDG_CONFIG_HOME="$STATE/config"
export XDG_CACHE_HOME="$STATE/cache"
export XDG_DATA_HOME="$STATE/data"
export PNPM_HOME="$STATE/pnpm-home"
export npm_config_prefix="$STATE/npm-global"
export PATH="$PNPM_HOME:$npm_config_prefix/bin:$PATH"
mkdir -p "$XDG_CONFIG_HOME" "$XDG_CACHE_HOME" "$XDG_DATA_HOME" "$PNPM_HOME" "$npm_config_prefix"

if command -v corepack >/dev/null 2>&1; then
  corepack prepare pnpm@10.24.0 --activate >/dev/null 2>&1 || true
fi
if ! command -v pnpm >/dev/null 2>&1; then
  if command -v npm >/dev/null 2>&1; then
    npm install -g pnpm@10.24.0
  else
    echo 'MISSING_NODE_PACKAGE_MANAGER=1' >&2
    exit 46
  fi
fi

{
  echo "node=$(node --version 2>/dev/null || echo MISSING)"
  echo "npm=$(npm --version 2>/dev/null || echo MISSING)"
  echo "pnpm=$(pnpm --version 2>/dev/null || echo MISSING)"
  echo "git=$(git --version)"
} > "$RECEIPTS/PHASE1_TOOLCHAIN.txt"

# ---- Source dependency/build proof ----
(
  cd "$SRC"
  set -o pipefail
  pnpm install --frozen-lockfile 2>&1 | tee "$RECEIPTS/PHASE1_PNPM_INSTALL.txt"
  pnpm test 2>&1 | tee "$RECEIPTS/PHASE1_TEST.txt"
  pnpm build 2>&1 | tee "$RECEIPTS/PHASE1_BUILD.txt"
)

# ---- Persistent Analyzer state/config ----
USER_DATA="$XDG_CONFIG_HOME/anything-analyzer"
mkdir -p "$USER_DATA"
chmod 0700 "$USER_DATA" || true

token_file="$STATE/mcp-token"
if [[ ! -s "$token_file" ]]; then
  python3 - <<'PY' > "$token_file"
import secrets
print(secrets.token_urlsafe(48))
PY
  chmod 0600 "$token_file"
fi
mcp_token="$(cat "$token_file")"

python3 - "$USER_DATA/mcp-server-config.json" "$mcp_token" "$MCP_PORT" <<'PY'
import json, os, sys, tempfile
path, token, port = sys.argv[1], sys.argv[2], int(sys.argv[3])
obj = {
    "enabled": True,
    "host": "0.0.0.0",
    "port": port,
    "authEnabled": True,
    "authToken": token,
}
os.makedirs(os.path.dirname(path), exist_ok=True)
fd, tmp = tempfile.mkstemp(prefix='.mcp-config.', dir=os.path.dirname(path), text=True)
with os.fdopen(fd, 'w', encoding='utf-8') as f:
    json.dump(obj, f, indent=2)
    f.write('\n')
os.chmod(tmp, 0o600)
os.replace(tmp, path)
PY

python3 - "$USER_DATA/mitm-proxy-config.json" "$MITM_PORT" <<'PY'
import json, os, sys, tempfile
path, port = sys.argv[1], int(sys.argv[2])
obj = {
    "enabled": True,
    "port": port,
    "caInstalled": False,
    "systemProxy": False,
}
os.makedirs(os.path.dirname(path), exist_ok=True)
fd, tmp = tempfile.mkstemp(prefix='.mitm-config.', dir=os.path.dirname(path), text=True)
with os.fdopen(fd, 'w', encoding='utf-8') as f:
    json.dump(obj, f, indent=2)
    f.write('\n')
os.chmod(tmp, 0o600)
os.replace(tmp, path)
PY

# ---- Canonical environment file, no secret content ----
cat > "$STATE/anything-analyzer.env" <<EOF
XDG_CONFIG_HOME=$XDG_CONFIG_HOME
XDG_CACHE_HOME=$XDG_CACHE_HOME
XDG_DATA_HOME=$XDG_DATA_HOME
PNPM_HOME=$PNPM_HOME
AA_ROOT=$ROOT
AA_APPIMAGE=$app
AA_MCP_PORT=$MCP_PORT
AA_MITM_PORT=$MITM_PORT
EOF
chmod 0600 "$STATE/anything-analyzer.env"

# ---- Pre-launch receipt ----
python3 - "$RECEIPTS/PHASE1_BOOTSTRAP.json" <<PY
import json, os, sys, time
receipt = {
  "schema": "TF_ANYTHING_ANALYZER_PHASE1_BOOTSTRAP/1",
  "utc_epoch": int(time.time()),
  "host": os.uname().nodename,
  "user": os.environ.get("USER", ""),
  "root": "$ROOT",
  "version": "$AA_VERSION",
  "source_commit": "$AA_COMMIT",
  "appimage_sha256": "$AA_APPIMAGE_SHA256",
  "mcp_port": int("$MCP_PORT"),
  "mitm_port": int("$MITM_PORT"),
  "system_proxy_modified": False,
  "status": "BOOTSTRAP_BUILD_PASS"
}
with open(sys.argv[1], 'w', encoding='utf-8') as f:
    json.dump(receipt, f, indent=2)
    f.write('\n')
PY

echo 'BOOTSTRAP_BUILD_PASS=1'
echo "NEXT=$TOOLS/tf-aa-launch-desktop.sh"
