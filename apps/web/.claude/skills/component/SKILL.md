---
name: component
description: Crea un nuevo componente o página en apps/web siguiendo las convenciones del proyecto (App Router, Tailwind, tipos de @repo/types). Úsalo cuando el usuario pida agregar una página, vista o componente de UI nuevo en el frontend.
---

Crea un componente o página nueva dentro de `apps/web`, siguiendo las convenciones de `apps/web/.claude/agents/frontend-specialist.md` (léelo primero si no lo tienes en contexto).

1. Pregunta (si no es obvio) si es una **página** (va en `src/app/<ruta>/page.tsx`) o un **componente reutilizable** (va en `src/components/<Nombre>.tsx`, crea la carpeta si no existe).
2. Usa TypeScript + Tailwind para estilos (clases utilitarias, sin CSS-in-JS ni módulos `.module.css` nuevos).
3. Si el componente necesita datos del backend, tipa la respuesta con `@repo/types` (no redefinas tipos que ya existan ahí) y reutiliza/extiende el patrón de `src/lib/api.ts` para el fetch.
4. Después de crear el archivo, corre `pnpm --filter web lint` y `pnpm --filter web type-check` para validar.
