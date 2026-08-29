# ============================================================================
# AprendeUTeca — deploy desde Windows en un comando:
#   .\deploy\deploy.ps1 "mensaje del commit"
#
# 1. Commit + push a GitHub (main)
# 2. SSH al servidor: git pull + reinicio del servicio
# 3. Verifica la salud de https://www.aprendeuteca.com
#
# Requiere: llave SSH ya configurada para oliver103@192.168.100.22
# (la primera instalación se hace una sola vez con install_server.sh, ver DEPLOY.md)
# ============================================================================
param([string]$Message = "deploy: actualización")

$ErrorActionPreference = "Stop"
$SERVER = "oliver103@192.168.100.22"
$ROOT = Split-Path -Parent $PSScriptRoot   # carpeta del proyecto

Write-Host "== 1/3 · Push a GitHub ==" -ForegroundColor Cyan
Set-Location $ROOT
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) { git commit -m $Message } else { Write-Host "  (sin cambios nuevos, solo re-deploy)" }
git push origin main

Write-Host "== 2/3 · Actualizando servidor ==" -ForegroundColor Cyan
ssh $SERVER "cd ~/aprendeuteca/app && git fetch origin main && git reset --hard origin/main && sudo systemctl restart aprendeuteca && sleep 1 && curl -fsS http://localhost:8099/api/health"
if ($LASTEXITCODE -ne 0) { throw "Fallo al actualizar el servidor" }

Write-Host "== 3/3 · Verificando dominio público ==" -ForegroundColor Cyan
try {
  $r = Invoke-RestMethod -Uri "https://www.aprendeuteca.com/api/health" -TimeoutSec 15
  Write-Host "  ✅ https://www.aprendeuteca.com responde (ok=$($r.ok))" -ForegroundColor Green
} catch {
  Write-Host "  ⚠️ El dominio público no respondió (¿túnel de Cloudflare activo?)" -ForegroundColor Yellow
}
Write-Host "== ✅ Deploy completo ==" -ForegroundColor Green
