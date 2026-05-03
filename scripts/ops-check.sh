#!/usr/bin/env bash
set -euo pipefail
DOMAIN=${DOMAIN:-2027.science}
LOCAL_PORT=${LOCAL_PORT:-5173}
section(){ printf '\n== %s ==\n' "$*"; }
section tools
for bin in node npm git wrangler cloudflared dig curl; do printf '%-14s' "$bin"; command -v "$bin" || true; done
section versions
(node --version || true); (npm --version || true); (wrangler --version || npx wrangler --version || true) 2>&1 | sed -n '1,2p'; (cloudflared --version || true)
section env-presence
env | grep -E '^(CLOUDFLARE|CF_|PORKBUN|OPENROUTER|NVIDIA|NIM|DEEPSEEK|AI_GATEWAY)' | sed 's/=.*/=<present>/' | sort || true
section package-scripts
node -e "const p=require('./package.json'); for (const k of ['dev','build','preview','check','test','cf:dev','cf:deploy','ops:check']) console.log(k+'='+(p.scripts?.[k]?'present':'missing'))"
section dns
for q in NS A AAAA CNAME; do echo "### $q $DOMAIN"; dig "$q" "$DOMAIN" +short || true; done; echo "### CNAME www.$DOMAIN"; dig CNAME "www.$DOMAIN" +short || true
section local-port
if command -v ss >/dev/null; then ss -ltn "sport = :$LOCAL_PORT" || true; else echo "ss unavailable"; fi
section cloudflared-config
for f in /etc/cloudflared/config.yml "$HOME/.cloudflared/config.yml" ops/cloudflared/config.example.yml; do [ -e "$f" ] && echo "present: $f" || echo "missing: $f"; done
