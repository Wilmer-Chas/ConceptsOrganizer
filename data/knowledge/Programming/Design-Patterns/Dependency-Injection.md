# Dependency Injection

Often grouped with behavioral / architectural practices.

## Intent

Decouple components by **passing dependencies in** instead of constructing them inside the class. Reduces tight coupling; improves flexibility and testability.

## When to use

- Reduce coupling between modules.
- Make classes testable with mocks/stubs.
- Centralize object creation (DI container) in large systems.
- Multiple dependencies that shouldn’t be `new`’d inside the client.

## Structure

1. **Client** — needs dependencies  
2. **Service** — provides capability (often an interface)  
3. **Injector** — supplies services to the client (manual or container)

Client receives Service from Injector rather than creating it.

## Pros

- Decoupling, testability, flexibility, scalability of object graphs  

## Cons

- Complexity, possible overhead, misuse via excessive indirection  

## Real world

Web frameworks (Spring, ASP.NET, Boost.DI, …) inject logging, DB, HTTP clients so implementations swap without rewriting clients.
