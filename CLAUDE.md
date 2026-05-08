# CLAUDE.md

Guidance for Claude Code and other AI agents working in `election-api`. Keep this file short — push detail into `docs/`.

## Project

NestJS/Fastify API serving public election and political candidacy data for GoodParty.org (places, races, positions, candidacies, districts). Postgres via Prisma. Internal service — called by `gp-api`, not exposed to end users.

## Commands (most-used first)

```bash
npm run start:dev              # Dev server (:3000) with watch
npm test                       # vitest run
npx vitest run src/path/to/file.test.ts        # single file
npx vitest                     # watch mode
npm run lint                   # eslint --fix on {src,apps,libs,test}/**/*.ts
npm run lint-format            # lint + prettier --write
npm run build                  # nest build → dist/

npm run migrate:dev            # create/apply a migration
npm run migrate:reset          # reset DB + migrate (LOCAL ONLY)
npm run migrate:deploy         # apply pending migrations (CI/prod)
npm run generate               # regenerate Prisma client
```

`npm run lint` runs `eslint --fix` — it mutates files. Stage your work first.

## Pointer table — when in doubt

| Doing | Read |
|-------|------|
| Adding an endpoint / module | `docs/architecture.md` § Module shape |
| Querying data / adding a Prisma model | `docs/data-model.md` |
| First-time setup | `docs/getting-started.md` |
| AI rule-by-rule code review | `ai-rules/` (git submodule) |

## Code style

- **No semicolons**, single quotes, trailing commas (`.prettierrc`)
- `unused-imports/no-unused-imports` is an **error**
- `@typescript-eslint/no-explicit-any` is currently **off** (relaxed). Prefer typed code anyway — `any` should be a last resort, not a habit.
- `noImplicitAny` is `false` and `tsconfig` `baseUrl` is `./`, so imports look like `import { X } from 'src/<feature>/...'` rather than `@/<feature>/...`.
- Arrow functions over `function` declarations
- Bias to WET over premature DRY

## Module shape

```
src/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts        # HTTP only
├── <feature>.service.ts           # extends createPrismaBase(MODELS.X)
├── <feature>.schema.ts            # Zod via nestjs-zod's createZodDto
├── <feature>.types.ts             # optional — type predicates / shared narrows
└── <feature>.service.test.ts      # vitest, colocated
```

`src/places/` is a clean reference module to copy.

## PrismaBase pattern

Services backed by a Prisma model **must** extend `createPrismaBase(MODELS.ModelName)` from `src/prisma/util/prisma.util.ts`. Provides `this.model`, `this.client`, `this.logger`, and bound passthroughs (`findMany`, `findFirst`, `findUnique`, `count`, etc.).

```ts
@Injectable()
export class PlacesService extends createPrismaBase(MODELS.Place) {
  constructor() {
    super()
  }
}
```

## Validation

Request validation uses `nestjs-zod`'s `createZodDto(zodSchema)` + the global `ZodValidationPipe` registered in `src/main.ts`. Define the schema, export a DTO class via `createZodDto`, and bind it to the controller param with `@Query() / @Param() / @Body()`.

Never bypass the DTO and read `request` raw — the global pipe is what enforces the schema.

## Testing

- Framework: **Vitest** with SWC (NestJS decorator metadata requires SWC, not esbuild)
- Test file pattern: `*.test.ts` colocated with source (NOT `.spec.ts`)
- Loads `.env.test`; `clearMocks: true` between tests
- Pattern: direct instantiation + `Object.defineProperty(service, '_prisma', { value: { ... } })` to inject a mocked client. See `src/places/places.service.test.ts` for the canonical shape.

## Never

- Never edit a file under `prisma/migrations/<timestamp>/` — applied migrations are immutable.
- Never expose this API to public traffic. It's an internal service consumed by `gp-api`; auth is network-level (VPC/SG).
- Never bypass `createZodDto` for request validation — the global `ZodValidationPipe` is the only enforcement point.
- Never disable `unused-imports/no-unused-imports` without an inline comment justifying it.
- Never add `any` casually — the rule is off, but typed code is still the bar.

## Environment

- Node `v22.12` (`.nvmrc`)
- npm (no `--legacy-peer-deps` needed)
- Postgres for local dev; `DATABASE_URL` in `.env`
- `node-gyp` prerequisites required for native deps (`libpg-query`)
