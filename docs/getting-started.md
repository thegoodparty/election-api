# Getting Started

First-time setup for `election-api` on macOS / Linux. Should take ~10 minutes once Postgres is running.

## Prerequisites

- **Node** matching `.nvmrc` (`v22.12`). If you use `nvm`: `nvm install && nvm use`.
- **npm** (ships with Node).
- **PostgreSQL** running locally on `:5432`. Easiest path is Docker:
  ```bash
  docker run --name election-api-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
  ```
  Or use Postgres.app / Homebrew.
- **node-gyp prerequisites** for your OS — required by `libpg-query` (a native dep). See https://github.com/nodejs/node-gyp#on-unix.

## Clone

This repo uses `ai-rules` as a git submodule. Clone with `--recursive`:

```bash
git clone --recursive git@github.com:thegoodparty/election-api.git
cd election-api
```

If you already cloned without `--recursive`:

```bash
git submodule update --init --recursive
```

`npm install` also runs `git submodule update --init --recursive` via the `postinstall` hook, so for fresh clones the submodule will populate either way.

## Configure environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required vars:

| Var | Default for local | Notes |
|-----|-------------------|-------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/electiondb` | Postgres connection string |
| `CORS_ORIGIN` | `http://localhost:4000` | Origin allowed by Fastify CORS |
| `LOG_LEVEL` | `debug` | `debug` enables Prisma query logs in dev |

`.env.test` mirrors `.env` for the vitest suite (already committed).

## Install + generate

```bash
nvm use            # if you use nvm
npm install        # also pulls the ai-rules submodule
npm run generate   # generate the Prisma client
```

## Set up the database

```bash
npm run migrate:reset    # wipes + recreates DB, applies all migrations
```

There's **no seed script** in this repo today — most data is populated by the ETL in `gp-data-platform`. For local exploration you can either:
- Connect to a copy of dev data (ask in #engineering for current setup), or
- Create rows manually via a `psql` session against the local DB.

## Run

```bash
npm run start:dev    # http://localhost:3000  (watch mode)
```

Health check: `curl http://localhost:3000/v1/health`. Swagger UI: http://localhost:3000/api.

## Test

```bash
npm test                                          # full suite
npx vitest run src/places/places.service.test.ts  # single file
npx vitest                                        # watch mode
```

Tests load `.env.test` automatically (via `vitest.config.ts`).

## Lint + format

```bash
npm run lint            # eslint --fix; mutates files — stage your work first
npm run lint-format     # lint + prettier --write
```

## Common gotchas

- **`prisma generate` not run** → TS errors complaining about missing types from `@prisma/client`. Run `npm run generate`.
- **`libpg-query` failed to build** → missing node-gyp prereqs (Xcode CLT on macOS, `build-essential` on Debian/Ubuntu).
- **Port 3000 in use** → set `PORT=3001` in `.env`, or stop the conflicting process.
- **Submodule directory empty** → `git submodule update --init --recursive`.

## Where to go next

- `CLAUDE.md` — agent + style guide for the repo.
- `docs/architecture.md` — module shape, HTTP surface, cross-service edges.
- `docs/data-model.md` — Prisma entities and how they relate.
- `ai-rules/` — org-wide review rules and skills (submodule).
