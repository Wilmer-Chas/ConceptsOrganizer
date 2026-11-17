# Mutex

## Intent

Mutual exclusion: only one thread in a critical section at a time — prevents race conditions on shared data.

## When to use

Multiple threads touch shared variables/files; need exclusive modify access.

## Structure

`lock` / `unlock` (and sometimes `try_lock`). RAII helpers: `std::lock_guard`, `std::unique_lock`.

## Example intuition

Without mutex: two threads incrementing a counter can yield nonsense totals. With mutex: serialize the critical section → expected result (e.g. 200000).

## Concerns

Race conditions · deadlock · starvation · livelock · thread-safety / memory issues.

Avoid “mutable mutex” patterns that encourage locking in surprising const contexts unless you fully understand the trade-offs.
