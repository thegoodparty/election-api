# scripts/perf/

Performance tooling wrappers. Convenience scripts behind the canonical commands in [`ai-rules/performance-tools.md`](../../ai-rules/performance-tools.md) (a submodule — run `git submodule update --init --recursive` once after clone if `ai-rules/` is empty).

| Script | What it does | Cookbook section |
|---|---|---|
| `setup-check.sh` | Audit the local env — what can/can't be measured right now | §11.6 |
| `bench-endpoint.sh` | Single-endpoint HTTP load test (autocannon) | §1 |
| `profile-cpu.sh` | V8 CPU profile of any node command (writes `.cpuprofile`) | §3 |
| `explain.sh` | `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)` against the configured DB | §5 |

Every script supports `-h` / `--help` and prints its prerequisites at the top of the help block.

## Quick start

```bash
# What's available locally?
scripts/perf/setup-check.sh
```

If `setup-check.sh` is clean, the rest will work. If something is ✗, the script tells you the install command for your platform (or the no-install fallback).

## Prereqs

The scripts try hard not to require global installs:

- **autocannon** — `npx --yes autocannon` fallback is automatic when not installed globally.
- **psql** — when not on PATH but Postgres is in Docker, `docker exec <container> psql` is used automatically. Override the container with `PG_DOCKER_CONTAINER=<name>`.
- **hyperfine** — no convenient `npx` equivalent; install if you want statistical comparison runs:
  ```bash
  brew install hyperfine        # mac
  cargo install hyperfine       # linux / cross-platform
  ```

For agents working in a fresh `git worktree`, also see `ai-rules/performance-tools.md` §11.6 — `.env` and the `ai-rules` submodule are common first-time stumbling blocks.

## Examples

```bash
# Quick health check load (defaults: 10 connections, 20s; npx fallback if no global)
scripts/perf/bench-endpoint.sh /health

# Heavier load against an election query endpoint
scripts/perf/bench-endpoint.sh -c 50 -d 60 /v1/elections?state=CA

# Profile a one-off ingestion / seed script
scripts/perf/profile-cpu.sh -- node dist/scripts/some-job.js
scripts/perf/profile-cpu.sh -- tsx scripts/some-job.ts

# Profile the running server — note: npm-script indirection is NOT supported.
# Profile the built JS directly:
scripts/perf/profile-cpu.sh -- node dist/main.js
# In another terminal:
scripts/perf/bench-endpoint.sh -c 20 -d 30 /v1/elections
# Then ^C the server; open the .cpuprofile in Chrome DevTools.

# EXPLAIN a slow query (auto-uses docker exec if host psql missing)
scripts/perf/explain.sh 'SELECT * FROM "Election" WHERE "state" = '\''CA'\'' LIMIT 10'
scripts/perf/explain.sh -f scripts/perf/slow.sql
```

## Critic tie-in

Per the [performance critic rules](../../ai-rules/performance.md), any PR that claims a performance improvement should include before/after numbers from one of these tools (or production telemetry). Without a measurement, the change is a refactor.

When the critic itself is an agent with shell access, it should run `setup-check.sh` first, then use any GREEN tool it has the prerequisites for (see the readiness table in `performance-tools.md`). It should never fabricate measurements.
