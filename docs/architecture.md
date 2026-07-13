# Diagrama de arquitectura

```mermaid
flowchart TB
    Internet((Internet))

    subgraph VPS["VPS 164.68.127.68 · Docker Swarm"]
        Traefik["Traefik\n:80 / :443\nTLS Let's Encrypt"]

        subgraph webnet["red overlay: web"]
            Frontend["frontend (nginx)\ncoronel.byronrm.com"]
            Backend["backend (FastAPI)\nbackalexis.byronrm.com"]
            Portainer["portainer\nportainal.byronrm.com"]
            Adminer["adminer\npopacheco.byronrm.com"]
        end

        subgraph dbnet["red overlay interna: backend-net"]
            DB[("PostgreSQL\ndb")]
        end

        DockerSock[(docker.sock)]
    end

    Internet -->|HTTPS 443| Traefik
    Traefik -->|Host: coronel.byronrm.com| Frontend
    Traefik -->|Host: backalexis.byronrm.com| Backend
    Traefik -->|Host: portainal.byronrm.com| Portainer
    Traefik -->|Host: popacheco.byronrm.com| Adminer

    Frontend -->|fetch /api/*| Backend
    Backend -->|SQLAlchemy| DB
    Adminer -->|SQL| DB
    Portainer -.->|administra contenedores| DockerSock
```

## Flujo de una solicitud

1. El navegador resuelve `coronel.byronrm.com` a `164.68.127.68` (registro DNS tipo A).
2. La solicitud llega por el puerto 443 a **Traefik**, que valida el certificado TLS (Let's Encrypt) y enruta segun el header `Host`.
3. Para el registro de usuarios, el **frontend** hace `fetch()` contra `https://backalexis.byronrm.com/api/usuarios`, que Traefik enruta al servicio **backend**.
4. El **backend** valida los datos, hashea la contraseña y los guarda en **PostgreSQL** a traves de la red interna `backend-net` (sin salida a internet).
5. **Adminer** permite inspeccionar la base de datos graficamente, tambien publicado via Traefik.
6. **Portainer** administra todos los contenedores del Swarm usando el socket de Docker del nodo manager.

## Redes Docker

| Red | Tipo | Proposito |
|---|---|---|
| `web` | overlay, attachable | Unica red por la que Traefik enruta trafico externo |
| `backend-net` | overlay, `internal: true` | Aisla la base de datos: solo backend y adminer pueden alcanzarla, sin salida a internet |

## CI/CD

```mermaid
flowchart LR
    A[git push a main] --> B[GitHub Actions]
    B --> C[Build backend image]
    B --> D[Build frontend image]
    C --> E[Push a GHCR]
    D --> E
    E --> F[SCP: stack.yml, Makefile, .env]
    F --> G[SSH al VPS]
    G --> H[docker stack deploy]
```
