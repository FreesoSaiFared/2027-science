#!/usr/bin/env bash
set -Eeuo pipefail

EXPECTED_HOST_RE='^(i9es|i9es-home)$'
ROOT='/mnt/SERVE/anything-analyzer'
STATE="$ROOT/state"
LOGS="$ROOT/logs"
RECEIPTS="$ROOT/receipts"
APP="$ROOT/bin/Anything-Analyzer-3.6.62.AppImage"
ENV_FILE="$STATE/anything-analyzer.env"
GUI_LOG="$LOGS/gui.log"

host="$(hostname)"
host_lc="$(printf '%s' "$host" | tr '[:upper:]' '[:lower:]')"
[[ "$host_lc" =~ $EXPECTED_HOST_RE ]] || { echo "REFUSING_HOST=$host" >&2; exit 42; }
[[ "$(id -un)" == 'ned' ]] || { echo "REFUSING_USER=$(id -un): launch this inside ned's graphical login." >&2; exit 43; }
[[ -x "$APP" ]] || { echo "MISSING_APPIMAGE=$APP" >&2; exit 44; }
[[ -r "$ENV_FILE" ]] || { echo "MISSING_ENV=$ENV_FILE" >&2; exit 45; }

mkdir -p "$LOGS" "$RECEIPTS"

# Export the canonical isolated state paths produced by bootstrap.
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

uid="$(id -u)"
desktop_pid=''
for pat in 'gnome-shell' 'plasmashell' 'xfce4-session' 'cinnamon' 'mate-session' 'Xorg' 'Xwayland'; do
  desktop_pid="$(pgrep -u "$uid" -n -x "$pat" 2>/dev/null || true)"
  [[ -n "$desktop_pid" ]] && break
done

# Fall back to the leader of an active graphical logind session.
if [[ -z "$desktop_pid" ]] && command -v loginctl >/dev/null 2>&1; then
  while read -r sid _rest; do
    [[ -n "${sid:-}" ]] || continue
    name="$(loginctl show-session "$sid" -p Name --value 2>/dev/null || true)"
    type="$(loginctl show-session "$sid" -p Type --value 2>/dev/null || true)"
    state="$(loginctl show-session "$sid" -p State --value 2>/dev/null || true)"
    leader="$(loginctl show-session "$sid" -p Leader --value 2>/dev/null || true)"
    if [[ "$name" == 'ned' && "$state" == 'active' && ( "$type" == 'wayland' || "$type" == 'x11' ) && -n "$leader" ]]; then
      desktop_pid="$leader"
      break
    fi
  done < <(loginctl list-sessions --no-legend 2>/dev/null || true)
fi

[[ -n "$desktop_pid" ]] || { echo 'NO_ACTIVE_NED_GRAPHICAL_SESSION=1' >&2; exit 46; }
[[ -r "/proc/$desktop_pid/environ" ]] || { echo "UNREADABLE_DESKTOP_ENV_PID=$desktop_pid" >&2; exit 47; }

# Import only the environment needed to join the user's desktop session.
while IFS= read -r kv; do
  case "$kv" in
    DISPLAY=*|WAYLAND_DISPLAY=*|DBUS_SESSION_BUS_ADDRESS=*|XDG_RUNTIME_DIR=*|XDG_SESSION_TYPE=*|XDG_CURRENT_DESKTOP=*|DESKTOP_SESSION=*|GDMSESSION=*)
      export "$kv"
      ;;
  esac
done < <(tr '\0' '\n' < "/proc/$desktop_pid/environ")

{
  echo "UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "HOST=$host"
  echo "USER=$(id -un)"
  echo "DESKTOP_PID=$desktop_pid"
  env | grep -E '^(DISPLAY|WAYLAND_DISPLAY|DBUS_SESSION_BUS_ADDRESS|XDG_RUNTIME_DIR|XDG_SESSION_TYPE|XDG_CURRENT_DESKTOP|DESKTOP_SESSION|GDMSESSION)=' | sed 's/^/ENV_/'
} > "$RECEIPTS/PHASE1_DESKTOP_ENV.txt"

# Do not start duplicate Analyzer instances against the same state directory.
existing="$(pgrep -u "$uid" -af 'Anything-Analyzer|anything-analyzer|Anything Analyzer' 2>/dev/null || true)"
if [[ -n "$existing" ]]; then
  printf '%s\n' "$existing" > "$RECEIPTS/PHASE1_EXISTING_PROCESS.txt"
  echo 'ANYTHING_ANALYZER_ALREADY_RUNNING=1'
  exit 0
fi

launch_and_observe() {
  local mode="$1"; shift
  : > "$GUI_LOG"
  echo "LAUNCH_MODE=$mode" | tee -a "$GUI_LOG"
  nohup "$APP" "$@" >> "$GUI_LOG" 2>&1 < /dev/null &
  local pid=$!
  echo "$pid" > "$STATE/gui.pid"
  sleep 12
  if kill -0 "$pid" 2>/dev/null || pgrep -u "$uid" -f 'Anything-Analyzer|anything-analyzer|Anything Analyzer' >/dev/null 2>&1; then
    echo "GUI_PROCESS_ALIVE=1 MODE=$mode PID=$pid"
    return 0
  fi
  echo "GUI_PROCESS_ALIVE=0 MODE=$mode PID=$pid" >&2
  return 1
}

mode='normal'
if ! launch_and_observe "$mode"; then
  # AppImage FUSE failures are common on otherwise healthy Ubuntu hosts.
  if grep -Eqi 'fuse|AppImage.*mount|dlopen.*libfuse' "$GUI_LOG"; then
    mode='appimage-extract-and-run'
    launch_and_observe "$mode" --appimage-extract-and-run || true
  fi
fi

if ! pgrep -u "$uid" -f 'Anything-Analyzer|anything-analyzer|Anything Analyzer' >/dev/null 2>&1; then
  # Local trusted workstation fallback: Electron can reject its Chromium sandbox
  # when packaging/mount permissions prevent the setuid sandbox from functioning.
  if grep -Eqi 'sandbox|SUID sandbox|chrome-sandbox' "$GUI_LOG"; then
    echo 'WARNING: Chromium sandbox startup failed; retrying this local application with --no-sandbox.' | tee -a "$GUI_LOG" >&2
    mode='no-sandbox'
    launch_and_observe "$mode" --no-sandbox || true
  fi
fi

if ! pgrep -u "$uid" -f 'Anything-Analyzer|anything-analyzer|Anything Analyzer' >/dev/null 2>&1; then
  echo 'ANYTHING_ANALYZER_GUI_START_FAILED=1' >&2
  tail -n 200 "$GUI_LOG" >&2 || true
  exit 48
fi

sleep 3
{
  echo "UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "MODE=$mode"
  echo 'PROCESSES:'
  pgrep -u "$uid" -af 'Anything-Analyzer|anything-analyzer|Anything Analyzer' || true
  echo 'LISTENERS:'
  ss -ltnp 2>/dev/null | grep -E ':(8888|23816)\b' || true
  echo 'WINDOWS:'
  command -v wmctrl >/dev/null 2>&1 && wmctrl -lx 2>/dev/null | grep -i 'anything\|analyzer' || true
} > "$RECEIPTS/PHASE1_GUI_START.txt"

echo 'PHASE1_GUI_START_PASS=1'
echo "MODE=$mode"
echo "LOG=$GUI_LOG"
