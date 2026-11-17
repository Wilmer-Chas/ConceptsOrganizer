# Condition Variables

## Intent

Synchronize threads on a **condition**: wait until something is true; notify others when it becomes true. The “if statement” of threading — without busy-waiting.

## When to use

- Wait for a state change (e.g. producer/consumer buffer).  
- Avoid polling shared flags.  
- Resource availability signaling.  
- Event/milestone coordination.  

Always used **with a mutex**.

## API sketch

- Wait (while holding/releasing mutex properly)  
- `notify_one()` / `notify_all()`  

Re-check conditions in a **loop** (spurious wakeups).

## Pros

Efficient wait, better resource coordination, flexible thread communication.

## Cons

Complexity, deadlock risk, spurious wakes, overhead, harder debugging, non-deterministic wake order.

## Real world

Worker pool waiting on a request queue; producers signal when work arrives.
