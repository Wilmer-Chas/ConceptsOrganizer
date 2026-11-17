# Performance Optimizations

In real apps, “optimization” usually means **reducing how often and how hard you fetch data** — not rewriting every loop.

## Where it usually matters

1. **Caching** — don’t recompute or refetch what you already have (memory cache, HTTP cache, CDN, DB query cache).
2. **API / I/O batching** — one round trip for many items beats N chatty calls.
3. **Fetch strategy** — pagination, fields you actually need, indexes, avoiding N+1 queries.
4. **Only then** micro-opts on hot paths that *are* the fetch/process loop.

Tight loops, unrolling, and fancy CPU tricks rarely win if you’re waiting on network or disk. They matter when you’ve already cut I/O and a tight loop is chewing CPU on the data you fetched.

## Practical checklist

- Measure: is time in **network / DB / disk** or in CPU?
- Cut round trips: batch, coalesce, cache.
- Fetch less: project columns, page results, debounce UI requests.
- If a loop over fetched data is hot: algorithms, data layout, locality (see Locality, Memory-Architecture).

## Lower-level (when the hot path is local compute)

- Data layouts (SoA vs AoS, padding, alignment)
- Loop-friendly access patterns / unrolling
- Prefer known sizes at compile time when it helps

## Profiling

Measure before guessing — profilers, APM, query plans, browser network panel. Automate timing so “optimizations” stay honest.
