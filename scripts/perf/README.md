# scripts/perf/

Performance tooling wrappers. Convenience scripts behind the canonical commands in the org-wide **performance-tools** cookbook (lives in [`thegoodparty/ai-rules`](https://github.com/thegoodparty/ai-rules/blob/main/performance-tools.md) — this repo doesn't carry the submodule).

| Script | What it does | Cookbook section |
|---|---|---|
| `bench-endpoint.sh` | Single-endpoint HTTP load test (autocannon) | §1 |
| `profile-cpu.sh` | V8 CPU profile of any node command (writes `.cpuprofile`) | §3 |
| `explain.sh` | `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)` against the configured DB | §5 |

## Prereqs

```bash
brew install hyperfine libpq           # libpq gives you psql
npm i -g autocannon                    # or run via npx autocannon
```

## Examples

```bash
# Quick health check load
scripts/perf/bench-endpoint.sh /health

# Heavier load against an election query endpoint
scripts/perf/bench-endpoint.sh -c 50 -d 60 /v1/elections?state=CA

# Profile a one-off ingestion / seed script
scripts/perf/profile-cpu.sh -- npx tsx scripts/some-job.ts

# Profile the running server (^C when done)
scripts/perf/profile-cpu.sh -- npm run start
# In another terminal:
scripts/perf/bench-endpoint.sh -c 20 -d 30 /v1/elections
# Then ^C the server; open the .cpuprofile in Chrome DevTools.

# EXPLAIN a slow query (reads DATABASE_URL from .env if not already exported)
scripts/perf/explain.sh 'SELECT * FROM "Election" WHERE "state" = '\''CA'\'' LIMIT 10'
scripts/perf/explain.sh -f scripts/perf/slow.sql
```

## Critic tie-in

Any PR that claims a performance improvement should include before/after numbers from one of these tools (or production telemetry). Without a measurement, the change is a refactor. See the [performance rules](https://github.com/thegoodparty/ai-rules/blob/main/performance.md) in the central ai-rules repo.
