# What Design Patterns Can and Cannot Do

## Can

1. **Solve recurring problems** — e.g. object creation (Singleton), structure (MVC-like), state changes (State, Strategy).
2. **Improve structure** — modular, reusable, separated concerns.
3. **Enhance maintainability** — easier to test and extend.
4. **Increase collaboration** — shared vocabulary on a team.
5. **Boost efficiency** — e.g. Flyweight / Proxy for memory or resource control.

## Cannot

1. **Provide functionality** — Strategy doesn’t implement the algorithms for you.
2. **Handle I/O or external integration** by themselves — files, DB, network still need code.
3. **Solve every design problem** — some need novel solutions.
4. **Control performance alone** — still need algorithms, structures, profiling.
5. **Create end-user apps alone** — no UI, input, or product features from patterns alone.
