# ============================================================================
# AprendeUteca - deploy desde Windows en un comando:
#   .\deploy\deploy.ps1 "mensaje del commit"
#
# 1. Commit + push a GitHub (main)
# 2. SSH al servidor: git reset --hard origin/main + reinicio del servicio
# 3. Verifica la salud de https://www.aprendeuteca.com
#
# Requiere: llave SSH configurada para oliver103@192.168.100.22 y sudo sin
# contrasena en el servidor (/etc/sudoers.d/oliver103-nopasswd).
# Nota PS 5.1: NO usar $ErrorActionPreference = "Stop" con git/ssh, porque sus
# warnings en stderr se convierten en errores fatales. Se revisa $LASTEXITCODE.
# ============================================================================
param([string]$Message = "deploy: actualizacion")

$ErrorActionPreference = "Continue"
$SERVER = "oliver103@192.168.100.22"
$ROOT = Split-Path -Parent $PSScriptRoot   # carpeta del proyecto
Set-Location $ROOT

function Fail($msg) { Write-Host "  [X] $msg" -ForegroundColor Red; exit 1 }

Write-Host "== 1/3 - Push a GitHub ==" -ForegroundColor Cyan
git add -A 2>$null
if ($LASTEXITCODE -ne 0) { Fail "git add fallo" }
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -q -m $Message 2>$null
    if ($LASTEXITCODE -ne 0) { Fail "git commit fallo" }
    Write-Host "  commit: $Message"
} else {
    Write-Host "  (sin cambios nuevos, solo re-deploy)"
}
git push origin main 2>&1 | Where-Object { $_ -notmatch "^warning:" } | ForEach-Object { "  $_" }
if ($LASTEXITCODE -ne 0) { Fail "git push fallo" }

Write-Host "== 2/3 - Actualizando servidor ==" -ForegroundColor Cyan
$remote = "cd ~/aprendeuteca/app && git fetch --quiet origin main && git reset --hard origin/main --quiet && sudo -n systemctl restart aprendeuteca && sleep 1 && curl -fsS http://localhost:8099/api/health && git log --oneline -1 | cat"
$out = ssh -o BatchMode=yes -o ConnectTimeout=15 $SERVER $remote 2>&1
$code = $LASTEXITCODE
$out | ForEach-Object { "  $_" }
if ($code -ne 0) { Fail "Fallo al actualizar el servidor (codigo $code). Revisa: ssh $SERVER 'systemctl status aprendeuteca'" }

Write-Host "== 3/3 - Verificando dominio publico ==" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri "https://www.aprendeuteca.com/api/health" -TimeoutSec 20
    if ($r.ok) { Write-Host "  [OK] https://www.aprendeuteca.com responde (ok=$($r.ok))" -ForegroundColor Green }
    else { Write-Host "  [!] El dominio respondio pero sin ok=true" -ForegroundColor Yellow }
} catch {
    Write-Host "  [!] El dominio publico no respondio (tunel de Cloudflare?): $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host "== Deploy completo ==" -ForegroundColor Green
