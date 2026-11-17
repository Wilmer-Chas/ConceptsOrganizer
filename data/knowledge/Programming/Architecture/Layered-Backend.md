# Layered Backend

Strict call direction:

`Controller → Service → Repository → Persistence`

## Allowed

| Layer | May call |
|---|---|
| Controllers | Services, Dto |
| Services | Repositories, Domain, Dto |
| Repositories | Persistence, Domain |
| Domain | (nothing outward) |
| Dto | (nothing outward) |
| Persistence | Domain |
| Middleware | cross-cutting only |

## Forbidden

- Repositories must never call Services or Controllers
- Controllers must never call Repositories or Persistence directly
- Domain must not reference Controllers, Services, Repositories, Middleware, Dto, or Persistence
- Dto must not reference Controllers, Services, Repositories, Middleware, or Persistence
- Domain stays free of framework types (e.g. ASP.NET); use Dto at the API boundary

## Why

Each layer has one job. Violations create spaghetti and make testing painful.

Related: Architecture-Tests, Unit-Tests, Integration-Tests
