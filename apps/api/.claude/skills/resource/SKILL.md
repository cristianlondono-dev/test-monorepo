---
name: resource
description: Crea un nuevo recurso NestJS (module/controller/service/entity) en apps/api siguiendo las convenciones del proyecto (TypeORM, @repo/types). Úsalo cuando el usuario pida agregar un nuevo endpoint, recurso o entidad en el backend.
---

Crea un recurso nuevo dentro de `apps/api`, siguiendo las convenciones de `apps/api/.claude/agents/backend-specialist.md` (léelo primero si no lo tienes en contexto).

1. Crea un directorio `src/<recurso>/` con `<recurso>.module.ts`, `<recurso>.controller.ts`, `<recurso>.service.ts` (y `<recurso>.entity.ts` si necesita persistencia), siguiendo el patrón de `src/health/`.
2. Si el recurso persiste datos: define la entidad de TypeORM, regístrala en `TypeOrmModule.forFeature([...])` dentro del módulo del recurso (no en `database.module.ts`, que solo configura la conexión global). Si ya existen entidades reales en el proyecto, usa migraciones en vez de depender de `synchronize`.
3. Cualquier DTO de request/response que también necesite el frontend va en `packages/types/src/` (exportado desde `index.ts`), no se define solo en `apps/api`.
4. Registra el nuevo módulo en `src/app.module.ts` (`imports`).
5. Después de crear el recurso, corre `pnpm --filter api lint` y `pnpm --filter api type-check`. Si agregaste lógica de negocio no trivial, agrega un test unitario junto al service (`<recurso>.service.spec.ts`) usando `@nestjs/testing`.
