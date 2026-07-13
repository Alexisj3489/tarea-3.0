# Proyecto Final — Despliegue de una Aplicación en un VPS

CRUD de usuarios (registro, listado, eliminación) desplegado en un VPS con
**Docker Swarm**, **Traefik** como proxy inverso con TLS automático,
**Portainer** para administración gráfica, **PostgreSQL** como base de datos
y **Adminer** como administrador gráfico. El pipeline de **CI/CD** en GitHub
Actions construye las imágenes, las publica en GHCR y despliega en el VPS
por SSH.

Integrantes: **Alexis Coronel** · **Isaac Pacheco**
VPS: Contabo — `164.68.127.68`

## Servicios y subdominios

| Servicio | Subdominio | Descripción |
|---|---|---|
| Frontend (la app) | https://coronel.byronrm.com | Formulario de registro y listado de usuarios |
| Backend (API) | https://backalexis.byronrm.com | API REST (FastAPI) — CRUD de usuarios |
| Portainer | https://portainal.byronrm.com | Administración gráfica de Docker |
| Adminer | https://popacheco.byronrm.com | Administrador gráfico de PostgreSQL |

> Los cuatro registros DNS tipo **A** deben apuntar a `164.68.127.68` antes de
> desplegar, porque Traefik solicita el certificado TLS por HTTP challenge
> (necesita que el dominio ya resuelva hacia el VPS).

Ver el diagrama completo en [`docs/architecture.md`](docs/architecture.md).

## Estructura del repositorio

```
.
├── backend/                 # API FastAPI (Python)
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # Panel web estático (nginx)
│   ├── index.html / style.css / script.js
│   ├── config.js.template    # se renderiza con la URL del backend en runtime
│   ├── docker-entrypoint.sh
│   └── Dockerfile
├── stack.yml                 # Stack de Docker Swarm (Traefik, Portainer, app, db, adminer)
├── Makefile                  # Atajos: init-swarm, deploy, logs, ps, rm
├── .env.example               # Variables que espera stack.yml
├── docs/architecture.md      # Diagrama de arquitectura
└── .github/workflows/tarea3.yml   # CI/CD
```

## 1. Preparar el VPS (una sola vez)

```bash
ssh root@164.68.127.68 -p 2222

# Docker
curl -fsSL https://get.docker.com | sh

# Inicializar Swarm (single-node)
docker swarm init

# Carpeta donde el workflow copiará stack.yml y Makefile
mkdir -p ~/landigb
```

Confirmar que el firewall del VPS permite los puertos **22/2222 (SSH)**,
**80** y **443**.

## 2. DNS

En el proveedor de DNS de `byronrm.com`, crear 4 registros **A** apuntando a
`164.68.127.68`:

```
coronel.byronrm.com      A   164.68.127.68
backalexis.byronrm.com   A   164.68.127.68
portainal.byronrm.com    A   164.68.127.68
popacheco.byronrm.com    A   164.68.127.68
```

## 3. Secrets de GitHub Actions

En **Settings → Secrets and variables → Actions** del repositorio, agregar:

| Secret | Valor |
|---|---|
| `TOKEN_AC` | Personal Access Token de GitHub con permiso `write:packages` |
| `VPS_HOST` | `164.68.127.68` |
| `VPS_USER` | `root` |
| `VPS_PASSWORD` | contraseña SSH del VPS |
| `VPS_SSH_PORT` | `2222` |
| `ACME_EMAIL` | correo para los avisos de Let's Encrypt |
| `POSTGRES_USER` | usuario de la base de datos |
| `POSTGRES_PASSWORD` | contraseña de la base de datos |
| `POSTGRES_DB` | nombre de la base de datos |

> Nunca se imprimen estos valores en los logs del workflow — se escriben
> directo a un archivo `.env` temporal que se borra del VPS después del
> despliegue.

Si el paquete en GHCR queda **privado**, además hay que iniciar sesión una
vez en el VPS con el mismo token (`docker login ghcr.io`) o marcar los
paquetes como públicos desde GitHub → Packages → Package settings.

## 4. Cómo despliega el workflow (`tarea3.0`)

1. **build-and-push**: instala dependencias de `backend/requirements.txt`
   como chequeo rápido, construye `backend/Dockerfile` y
   `frontend/Dockerfile` por separado y publica ambas imágenes en
   `ghcr.io/<usuario>/proyecto-backend` y `proyecto-frontend`.
2. **deploy**: genera un `.env` a partir de los secrets, lo copia junto con
   `stack.yml` y `Makefile` al VPS por SCP, se conecta por SSH, inicializa
   Swarm si hace falta y ejecuta `docker stack deploy -c stack.yml appstack`.

Se dispara en cada `push` a `main`.

## 5. Despliegue manual (sin GitHub Actions)

```bash
scp -P 2222 stack.yml Makefile root@164.68.127.68:~/landigb/
ssh root@164.68.127.68 -p 2222
cd ~/landigb
cp /ruta/a/.env.example .env   # y editar con valores reales
make init-swarm
make deploy
make ps
```

## 6. Verificar que todo está arriba

```bash
make ps
# o
docker stack services appstack
docker stack ps appstack
```

Probar cada URL:
- `https://coronel.byronrm.com` → formulario de registro
- `https://backalexis.byronrm.com/api/health` → `{"status":"ok"}`
- `https://portainal.byronrm.com` → login de Portainer (crear cuenta admin en el primer acceso)
- `https://popacheco.byronrm.com` → login de Adminer (Sistema: PostgreSQL, Servidor: `db`, usuario/clave: los de `POSTGRES_USER`/`POSTGRES_PASSWORD`, Base de datos: `POSTGRES_DB`)

## 7. Comandos útiles

```bash
make logs SERVICE=backend      # logs en vivo de un servicio
make logs SERVICE=traefik
docker service update --force appstack_backend   # forzar un redeploy
make rm                        # eliminar todo el stack
```

## Notas de diseño (para la defensa)

- **Aislamiento de red**: `backend-net` es `internal: true`, así la base de
  datos nunca es alcanzable desde internet — solo `backend` y `adminer`
  pueden conectarse a ella, y ninguno de los dos expone el puerto 5432 hacia
  afuera; todo el tráfico externo entra únicamente por Traefik.
- **TLS automático**: Traefik resuelve certificados por *HTTP challenge* de
  Let's Encrypt, por eso el DNS debe apuntar al VPS antes de desplegar.
- **Variables de entorno**: ninguna credencial ni URL está hardcodeada en las
  imágenes; `docker-entrypoint.sh` del frontend genera `config.js` en el
  arranque del contenedor a partir de `API_BASE_URL`, y el backend lee sus
  credenciales de base de datos vía variables de entorno definidas en
  `stack.yml`.
- **Contraseñas de usuarios**: se guardan con hash `bcrypt` (`passlib`),
  nunca en texto plano.
