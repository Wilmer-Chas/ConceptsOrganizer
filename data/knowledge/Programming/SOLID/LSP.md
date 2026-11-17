# L — Liskov Substitution Principle

Subclass instances should be usable wherever the base type is expected **without breaking correctness**.

## Why

Preserves program behavior under substitution.

## How

Subclasses must honor base expectations. Classic counterexample: treating Square as a Rectangle and mutating width/height independently — better as separate types.
