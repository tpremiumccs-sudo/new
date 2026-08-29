#!/usr/bin/env bash
# ============================================================================
# AprendeUTeca — instalación/actualización en el servidor (Ubuntu/Debian).
# Se ejecuta EN el servidor (192.168.100.22) como usuario normal con sudo:
#
#   bash install_server.sh                # instala app + servicio systemd
#   bash install_server.sh --with-tunnel  # además instala cloudflared con el
#                                         # token de deploy/secrets.env
#
# Idempotente: puedes correrlo las veces que quieras.
# ============================================================================
set -euo pipefail

REPO_URL="${AQ_REPO:-https://github.com/tpremiumccs-sudo/new.git}"
APP_DIR="$HOME/aprendeuteca/app"
DATA_DIR="$HOME/aprendeuteca-data"
PORT="${AQ_PORT:-8099}"
SERVICE=aprendeuteca
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "== 1/4 · Código =="
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch origin main && git -C "$APP_DIR" reset --hard origin/main
else
  mkdir -p "$(dirname "$APP_DIR")"
  git clone --branch main "$REPO_URL" "$APP_DIR"
fi
mkdir -p "$DATA_DIR"

echo "== 2/4 · Servicio systemd ($SERVICE, puerto $PORT) =="
sudo tee /etc/systemd/system/$SERVICE.service > /dev/null << UNIT
[Unit]
Description=AprendeUTeca (ActuarIQ) - app + API
After=network.target

[Service]
Type=simple
User=$USER
Environment=AQ_PORT=$PORT
Environment=AQ_DB=$DATA_DIR/aq.db
Environment=AQ_ROOT=$APP_DIR
Environment=AQ_ADMINS=oliver
ExecStart=/usr/bin/python3 $APP_DIR/server/server.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable --now $SERVICE
sudo systemctl restart $SERVICE

echo "== 3/4 · Salud local =="
sleep 1
curl -fsS "http://localhost:$PORT/api/health" && echo "  ← API OK"

if [ "${1:-}" = "--with-tunnel" ]; then
  echo "== 4/4 · Cloudflare Tunnel =="
  TOKEN="${CLOUDFLARE_TUNNEL_TOKEN:-}"
  [ -z "$TOKEN" ] && [ -f "$HERE/secrets.env" ] && TOKEN="$(grep -oP '(?<=^CLOUDFLARE_TUNNEL_TOKEN=).*' "$HERE/secrets.env" || true)"
  [ -z "$TOKEN" ] && [ -f "$APP_DIR/deploy/secrets.env" ] && TOKEN="$(grep -oP '(?<=^CLOUDFLARE_TUNNEL_TOKEN=).*' "$APP_DIR/deploy/secrets.env" || true)"
  if [ -z "$TOKEN" ]; then
    echo "  ✗ Falta CLOUDFLARE_TUNNEL_TOKEN (expórtalo o copia deploy/secrets.env junto a este script)"; exit 1
  fi
  if ! command -v cloudflared > /dev/null; then
    ARCH=$(dpkg --print-architecture 2>/dev/null || echo amd64)
    curl -fL -o /tmp/cloudflared.deb "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$ARCH.deb"
    sudo dpkg -i /tmp/cloudflared.deb
  fi
  sudo cloudflared service install "$TOKEN" || true   # ya instalado = ok
  sudo systemctl restart cloudflared
  echo "  ← túnel activo; revisa https://www.aprendeuteca.com"
else
  echo "== 4/4 · (túnel omitido; usa --with-tunnel la primera vez) =="
fi

echo "== ✅ Listo =="
