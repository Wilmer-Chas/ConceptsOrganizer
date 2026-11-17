# Integration Tests

Test that **pieces work together** — real (or close-to-real) HTTP, DB, filesystem, or app host.

## Characteristics

- Slower than unit tests
- Catch wiring bugs, config, and real I/O paths
- Example: spin up the API host and hit `/api/...` against a temp knowledge root

## When to use

- Controller ↔ Service ↔ Repository ↔ disk/DB paths
- Auth, CORS, serialization, file layout contracts
- Anything unit mocks would lie about

Related: Unit-Tests, Architecture-Tests, Layered-Backend
