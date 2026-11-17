# Architecture Tests

Automated checks that **dependency rules stay true** — not “does this function return 2?”, but “does Controller still only talk to Service?”

## Idea

Use a library (e.g. NetArchTest in .NET) to assert:

- Controllers do not depend on Repositories / Persistence
- Services do not depend on Controllers / Persistence
- Domain does not depend on outer layers or framework types
- Features do not import other Features (frontend)

## Practice

- Keep architecture tests next to unit/integration tests
- Fail the build when a layer rule breaks
- Add a rule when you invent a new boundary — don’t rely on memory alone

Related: Layered-Backend, Frontend-Features, Unit-Tests, Integration-Tests
