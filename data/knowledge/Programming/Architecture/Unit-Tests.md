# Unit Tests

Test a **small unit** in isolation (function, class, service) with dependencies mocked or faked.

## Characteristics

- Fast
- No real DB / network / filesystem when possible
- Pin behavior of Controllers/Services (or pure domain logic) with known inputs/outputs

## Rules of thumb

- New or changed Controllers and Services should get unit (or focused) tests
- Every meaningful interaction deserves coverage
- Prefer clear arrange → act → assert over clever setups

Related: Integration-Tests, Architecture-Tests, TDD
