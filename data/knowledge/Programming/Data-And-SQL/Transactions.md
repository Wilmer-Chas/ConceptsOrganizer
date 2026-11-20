# Transactions

A **transaction** groups related database work into **one unit**: either all of it succeeds, or none of it does.

## Why it matters (transfer example)

Bad approach: move money as two separate events.

1. Subtract from account A  
2. Add to account B  

If the system dies after step 1, money is gone from A but never arrives in B.

A transaction runs both steps together. Crash or error in the middle → **rollback** (as if nothing happened). Success → **commit** (both changes stick).

Often that is several SQL statements between `BEGIN` and `COMMIT` — still one all-or-nothing unit.

## ACID

| Letter | Meaning |
|---|---|
| **A**tomicity | All steps succeed, or none do (commit or rollback). |
| **C**onsistency | When it finishes, DB rules still hold (checks, foreign keys, “balance ≥ 0” if you set that). |
| **I**solation | Overlapping transactions don’t mess up each other’s work. |
| **D**urability | After commit, the change stays saved even if the process or machine goes down (how strong that is depends on DB settings). |

Consistency means “the database’s rules are still true” — you still have to define those rules in the schema and in the transaction logic.

## Isolation (Alice & Bob)

Alice and Bob withdraw from the same account at the same time. Both read balance `100`, both take `80`, both think it worked — balance is wrong. That is a **race**.

App intuition: a **mutex** (or similar lock) around “read → decide → write” stops two threads from overlapping that sequence.

Databases usually handle this **inside the engine**:

- **Locks** — conflicting writers wait their turn  
- **MVCC** — readers can use a snapshot so they don’t block every write  
- **Isolation levels** — how strict the DB is about overlap (more strict = safer, often slower)

So the mutex picture is right for the problem shape. In practice you use **transactions**, the right **isolation level**, and careful statements — not a giant lock around the whole database from app code.

## Practical takeaway

- Multi-step money / inventory / “create parent + children” work → **one transaction**  
- Assume a crash mid-way; design for rollback  
- When two sessions touch the same rows, think **isolation**, not only “did my SQL run?”

Related: Indexes, ORM, Migrations-And-Schema, Cpp-And-SQLite
