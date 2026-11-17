# Transactions

A **transaction** groups related database work so it is treated as **one atomic unit**: either all of it lands, or none of it does.

## Why it matters (transfer example)

Classic failure: move money by treating **debit** and **credit** as two separate events.

1. Subtract from account A  
2. Add to account B  

If the process dies after step 1, money vanished. If it dies after a half-applied write, balances lie.

A transaction wraps both steps (and any checks) in **one** commit boundary. Crash or error mid-way → **rollback**; success → **commit**. The DB (and its durability settings) then own whether that commit survives power loss.

Mental model: not “one SQL string,” but **one all-or-nothing unit of work** — often several statements between `BEGIN` and `COMMIT`.

## ACID

| Letter | Meaning |
|---|---|
| **A**tomicity | All operations succeed, or none do (commit or rollback). |
| **C**onsistency | When a transaction ends, constraints and invariants still hold (checks, FKs, balances ≥ 0 if you enforce them). |
| **I**solation | Concurrent transactions don’t incorrectly interfere with each other. |
| **D**urability | After commit, changes survive according to the DB’s durability configuration (fsync, WAL, replicas, etc.). |

Consistency here is “the DB’s rules stay true,” not “the business is always right” — you still model those rules in schema and transaction logic.

## Isolation (Alice & Bob)

Same account, Alice and Bob withdraw at the same time → classic **race**: both read balance 100, both withdraw 80, both “succeed,” final balance wrong.

App-level intuition: a **mutex / critical section** around “read → decide → write” stops two threads from interleaving that sequence. That’s the right *shape* of the problem (serialize conflicting access).

What databases actually do is usually **inside the engine**:

- **Locks** (row/table) so conflicting writers wait  
- **MVCC** (snapshots) so readers see a consistent version without blocking every read  
- **Isolation levels** (Read Committed, Repeatable Read, Serializable, …) that trade how much interference you allow vs how much you wait/retry  

So: mutex/atomic guards are a useful concurrency analogy; in practice you rely on **transactions + isolation level + correct statements** (and sometimes `SELECT … FOR UPDATE`) rather than locking the whole DB from the app.

## Practical takeaway

- Put every multi-step invariant (transfers, “create parent + children,” inventory decrement) in **one transaction**.  
- Assume crash mid-flight; design for rollback.  
- When two sessions touch the same rows, think **isolation**, not only “did my SQL run.”

Related: Indexes, Cpp-And-SQLite
