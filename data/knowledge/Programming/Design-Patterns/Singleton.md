# Singleton Pattern (Creational)

## Intent

Ensure a class has only one instance and a global access point (`getInstance()`-style).

## When to use

- Shared resource: DB connection, logger, config manager.
- Controlled lifetime of a globally available resource.

## Benefits

1. Centralized access  
2. Resource efficiency (one instance)  
3. Consistent shared state  

## Considerations

1. **Thread safety** — mutex/locks if needed; C++11 static locals are thread-safe for init.
2. **Lazy vs eager** — create on first use vs at startup.
3. **Global state** — harder testing; hidden dependencies.
4. **Alternatives** — Dependency Injection, Service Locator.
5. **Lifetime** — prefer smart pointers / careful cleanup; watch static destruction order.

## Template for notes

Category · Intent · When to Use · Structure · C++ Example · Pros/Cons · Real-World Application (e.g. DB connection manager).
