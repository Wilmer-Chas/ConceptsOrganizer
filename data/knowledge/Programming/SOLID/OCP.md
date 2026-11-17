# O — Open/Closed Principle

Entities should be **open for extension, closed for modification** — add behavior without rewriting existing classes/methods (which can break tests and callers).

Decorator pattern is one common recommendation.

## Why

New features without editing stable code → fewer regressions.

## How

Inheritance/interfaces; extend via polymorphism instead of editing the base.
