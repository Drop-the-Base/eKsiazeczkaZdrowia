#!/usr/bin/env bash
# HTTPS tunnel (Cloudflare quick tunnel, no account) so a phone gets camera, microphone and PWA install.
# Usage: npm run tunnel -w server [-- prod|dev]
#   prod (default): production server :8787 – run `npm run build && npm start` first; serves / and /lekarz/
#   dev:            Vite dev server of the patient PWA :5173 – run `npm run dev` first
set -euo pipefail

mode="${1:-prod}"
case "$mode" in
  prod) port="${PORT:-8787}"; hint='npm run build && npm start' ;;
  dev) port=5173; hint='npm run dev' ;;
  *) echo "Użycie: npm run tunnel -w server [-- prod|dev]" >&2; exit 1 ;;
esac

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "Brak cloudflared. Zainstaluj: brew install cloudflared (macOS) / winget install Cloudflare.cloudflared (Windows)." >&2
  exit 1
fi
if ! curl -s -o /dev/null "http://localhost:$port"; then
  echo "Nic nie słucha na :$port – najpierw uruchom: $hint" >&2
  exit 1
fi

echo "Tunel HTTPS do http://localhost:$port – adres https://…trycloudflare.com pojawi się poniżej (Ctrl+C kończy)."
exec cloudflared tunnel --no-autoupdate --url "http://localhost:$port"
