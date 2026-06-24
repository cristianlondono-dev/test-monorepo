---
name: dev-stack
description: Levanta el stack completo de desarrollo local del monorepo (Postgres en Docker + apps/web y apps/api en modo dev vía turbo). Úsalo cuando el usuario quiera "levantar el proyecto", "correr todo en local" o probar cambios end-to-end entre frontend y backend.
---

Levanta el entorno de desarrollo local de `example-turbo`.

1. Si no existe `.env` en la raíz, créalo a partir de `.env.example` (`cp .env.example .env`) y avisa al usuario — son credenciales de desarrollo, no secretos reales.
2. Si `node_modules` no existe en la raíz, corre `pnpm install`.
3. Levanta solo Postgres en Docker (no las apps, esas corren en modo dev fuera de Docker para hot-reload): `docker compose up -d db`.
4. Espera a que el healthcheck de `db` esté `healthy` (`docker compose ps`) antes de continuar.
5. Corre `pnpm dev` desde la raíz (ejecuta `turbo run dev`, levanta `apps/web` y `apps/api` en paralelo).
6. Informa al usuario las URLs: web en `http://localhost:3000`, API en `http://localhost:4000` (`GET /health` para confirmar conexión a la base de datos).

Para levantar TODO dentro de Docker (incluyendo web y api ya buildeadas, no en modo dev), usa en su lugar `docker compose up --build` desde la raíz.
