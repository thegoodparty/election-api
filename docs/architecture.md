# Architecture

A pointer-heavy doc. Detailed conventions live in `CLAUDE.md` and the rule files in `ai-rules/`.

## Stack

- **NestJS 11** on **Fastify** (not Express)
- **Prisma 6** with multi-file schema folder (`previewFeatures = ["prismaSchemaFolder"]`); `prisma-json-types-generator` for JSON column typing
- **Zod** via `nestjs-zod` (`createZodDto` + global `ZodValidationPipe`) for request validation
- **Vitest 4** with SWC for tests (esbuild can't emit decorator metadata; SWC can)
- **OpenTelemetry** (traces/metrics/logs OTLP) wired in `src/otel.ts`; `nestjs-pino` for structured logs
- **Pulumi** (TypeScript) for IaC under `deploy/`

## Module shape

```
src/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts        # HTTP only — no business logic
├── <feature>.service.ts           # extends createPrismaBase(MODELS.X)
├── <feature>.schema.ts            # Zod schemas + createZodDto classes
├── <feature>.types.ts             # optional — narrowing helpers / shared TS types
├── <feature>.util.ts              # optional — pure helpers
└── <feature>.service.test.ts      # vitest, colocated
```

`src/places/` is the cleanest reference module. Start there if you need a pattern to copy.

`PrismaModule` is `@Global` (`src/prisma/prisma.module.ts`) so feature modules don't import it explicitly except where they want to be self-documenting (e.g. `src/places/places.module.ts` lists it).

## HTTP surface

All routes are mounted under the global prefix `v1` (set in `src/main.ts`). Controllers live at `src/<feature>/<feature>.controller.ts`:

| Path | Module |
|------|--------|
| `GET /v1/health` | `src/health/` |
| `GET /v1/places`, `/places/by-position-id/:id`, `/places/most-elections` | `src/places/` |
| `GET /v1/districts/list`, `/types`, `/names`, `/:id` | `src/districts/` |
| `GET /v1/positions/by-ballotready-id/:id`, `/:id` | `src/positions/` |
| `GET /v1/positions/search` (ZIP → position lookup) | `src/zipToPosition/` |
| `GET /v1/candidacies` | `src/candidacies/` |
| `GET /v1/races` | `src/races/` |
| `GET /v1/projectedTurnout` | `src/projectedTurnout/` |
| `GET /v1/voter-issues` | `src/voterIssues/` |

Swagger is mounted at `/api` (no prefix) for ad-hoc exploration in non-prod.

## Auth

There is no application-level auth. `election-api` is an **internal** service — the only callers are `gp-api` and other internal services inside the VPC. Network-level controls (VPC, security groups in `deploy/components/`) are the boundary. Don't add public endpoints without first changing this assumption.

CORS is open (`origin: '*'`) for the same reason — change `CORS_ORIGIN` in env if/when this is no longer internal-only.

## Cross-service edges

| Direction | Service | Protocol | Notes |
|-----------|---------|----------|-------|
| inbound | `gp-api` | HTTP (internal) | The primary consumer; relays election-api responses to webapp users |
| inbound | `gp-data-platform` (read) | Postgres direct | ETL writes/reads via direct DB connection |
| outbound | none in app code | — | Data ingestion happens in `gp-data-platform`, not here |

No shared TS types package today — each side declares its own DTOs. If/when contracts are needed across the gp-api ↔ election-api edge, they'll go through `@goodparty_org/contracts` (lives in `gp-api`).

See `ai-rules/system-map.md` for the full cross-repo map.

## Bootstrap

`src/main.ts` is the entry point. In order:

1. Load alias + dotenv (`module-alias`, `src/configrc.ts`)
2. Create `NestFastifyApplication` with `rawBody: true` and a UUID `genReqId`
3. Swap in `nestjs-pino` as the global logger
4. Register Fastify OTel instrumentation (when present in global)
5. Set global prefix `v1`, register `ZodValidationPipe`, register `AllExceptionsFilter`
6. Build Swagger doc at `/api`
7. Register `@fastify/helmet`, `@fastify/cors`, `@fastify/static` (serves `public/`)
8. Listen on `PORT` (default 3000)

## Key patterns

- **`createPrismaBase(MODELS.X)`** (`src/prisma/util/prisma.util.ts`) — every service backed by a Prisma model extends this. Gives `this.model`, `this.client`, `this.logger`, and bound passthroughs (`findMany`, `findFirst`, `findUnique`, `findUniqueOrThrow`, `count`).
- **`createZodDto(zodSchema)`** — `nestjs-zod` decorator-friendly DTO. Bind to `@Query()`/`@Param()`/`@Body()`; the global `ZodValidationPipe` enforces it. Inputs that come from query strings often need `z.preprocess(...)` to coerce strings to booleans/numbers.
- **`AllExceptionsFilter`** (`src/shared/filters/allExceptions.filter.ts`) — global filter that returns the real error message for non-`HttpException` errors. Safe because the API is internal-only; aids debugging from gp-api.
- **`buildColumnSelect`** (`src/prisma/util/prisma.util.ts`) — builds a typed Prisma `select` clause from a comma-separated string of column names, used by endpoints that let callers pick fields.

## ADRs

`docs/adr/` is not yet seeded for this repo. Add one when a non-obvious decision lands (e.g., why network-level auth instead of JWT, why nestjs-zod vs raw Zod). Use `ai-rules/adr-template.md`.
