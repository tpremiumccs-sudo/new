# 🚀 Despliegue — AprendeUTeca (www.aprendeuteca.com)

La app vive en tu servidor local (`192.168.100.22`, usuario `oliver103`) y sale a
internet por un **Cloudflare Tunnel** hacia `www.aprendeuteca.com` (ruta HTTP →
`localhost:8099`, tal como la configuraste en el panel de Cloudflare).

```
[Alumnos] → https://www.aprendeuteca.com → Cloudflare Tunnel → servidor:8099 → server.py (app + API + SQLite)
```

## 0. Una sola vez: subir este código a GitHub (desde tu PC)

```powershell
cd <carpeta-del-proyecto>                      # esta carpeta (aprendeuteca)
Remove-Item -Recurse -Force .git -ErrorAction Ignore   # limpia restos si existen
git init -b main
git add -A
git commit -m "AprendeUTeca v2: servidor con cuentas, arbol de lecciones, corazones y deploy"
git remote add origin https://github.com/tpremiumccs-sudo/new.git
git push -f origin main            # main pasa a ser la rama real del proyecto
```

> `-f` es intencional: el `main` viejo solo tenía un `.gitignore`; todo el
> trabajo real (que estaba en `gh-pages`) ya viene incluido aquí.
> Después puedes borrar las ramas `claude/*` y `gh-pages` viejas en GitHub, y
> **desactivar GitHub Pages** (Settings → Pages) para que no quede publicada la
> versión vieja sin servidor.

## 1. Una sola vez: instalar en el servidor

```powershell
# desde tu PC — copia el instalador y los secretos al servidor:
scp deploy/install_server.sh deploy/secrets.env oliver103@192.168.100.22:~
ssh oliver103@192.168.100.22 "bash install_server.sh --with-tunnel"
```

Eso hace todo: clona el repo, crea el servicio **systemd** `aprendeuteca`
(puerto 8099, arranca solo al encender el servidor), instala **cloudflared**
con tu token y lo deja como servicio. Al terminar, abre
<https://www.aprendeuteca.com> — debe salir la pantalla de crear cuenta.

## 2. Cada actualización (1 comando)

```powershell
.\deploy\deploy.ps1 "qué cambiaste"
```

Hace commit+push, actualiza el servidor por SSH, reinicia el servicio y
verifica `https://www.aprendeuteca.com/api/health`.

## Datos y cuentas

- Base de datos: `~/aprendeuteca-data/aq.db` en el servidor (SQLite, **fuera**
  de la carpeta del repo: los deploys nunca tocan los datos).
- Respaldo: `scp oliver103@192.168.100.22:~/aprendeuteca-data/aq.db .`
- Cuentas admin: usuario `oliver` (configurable con `AQ_ADMINS` en el servicio).
  El admin puede publicar tareas/calendario a todo el grupo desde la app.
- Progreso viejo de GitHub Pages: al entrar por primera vez desde un navegador
  que tenía progreso local, la app ofrece **importarlo a la cuenta** y luego
  limpia el localStorage.

## Si algo falla

```bash
ssh oliver103@192.168.100.22
sudo systemctl status aprendeuteca     # ¿la app corre?
sudo journalctl -u aprendeuteca -n 50  # logs de la app
sudo systemctl status cloudflared      # ¿el túnel corre?
curl localhost:8099/api/health         # ¿responde localmente?
```

- Local responde pero el dominio no → problema de túnel (`sudo systemctl restart cloudflared`).
- Sugerencia en Cloudflare: agrega también la ruta del dominio raíz
  `aprendeuteca.com` → `http://localhost:8099` (hoy solo está `www`).

## Seguridad

- `deploy/secrets.env` (token del túnel) está **fuera de git**. No lo pegues en
  el repo público ni en chats; si se filtra, rota el token en Cloudflare
  (Tunnels → ... → Refresh token) y vuelve a correr el paso 1.
- Los PIN de alumnos se guardan con hash PBKDF2 (nunca en claro). Las sesiones
  usan cookie HttpOnly. El login tiene límite de intentos.
