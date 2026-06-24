# example-turbo

Monorepo base (Turborepo + pnpm) con:

- `apps/web` — Next.js (App Router, TypeScript, Tailwind).
- `apps/api` — NestJS + TypeORM + PostgreSQL.
- `packages/types` — tipos/contratos compartidos entre `web` y `api`.
- `packages/eslint-config` — configuración de ESLint centralizada.
- `packages/typescript-config` — `tsconfig` base centralizado.
- `openspec/` — flujo spec-driven para cambios (ver `openspec/README.md` tras `openspec init`).
- `.claude/` — agentes y skills de Claude Code (ver más abajo).

## Requisitos

- Node.js >= 22.13 (`nvm use`)
- pnpm >= 11 (`corepack enable` o `npm i -g pnpm`)
- Docker + Docker Compose

## Desarrollo local

```bash
cp .env.example .env
pnpm install

# Levantar Postgres en Docker y ambas apps en modo dev
docker compose up -d db
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000 (`GET /health` para verificar conexión a DB)

## Scripts

```bash
pnpm build        # build de todas las apps/paquetes (turbo)
pnpm lint          # lint centralizado
pnpm type-check    # chequeo de tipos
pnpm format        # prettier
```

## Docker (stack completo)

```bash
docker compose build
docker compose up
```

Levanta `db` (Postgres), `api` (NestJS, puerto 4000) y `web` (Next.js, puerto 3000).

## Agentes y skills de Claude Code

- `.claude/agents/frontend.md`, `backend.md`, `testing.md`: agentes centralizados que enrutan el trabajo. Los de frontend/backend leen y aplican las convenciones detalladas definidas en cada app (`apps/web/.claude/agents/frontend-specialist.md` y `apps/api/.claude/agents/backend-specialist.md`) antes de actuar.
- Cada app tiene además sus propios `agents/` y `skills/` para cuando se trabaja directamente dentro de `apps/web` o `apps/api`.

## OpenSpec

Este repo usa [OpenSpec](https://github.com/Fission-AI/OpenSpec) para proponer y documentar cambios antes de implementarlos. Ver `openspec/` y los comandos `/openspec:*` disponibles en Claude Code.
