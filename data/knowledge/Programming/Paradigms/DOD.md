# DOD — Data-Oriented Design

Design philosophy focused on how **data is laid out and accessed in memory**, aiming for performance and cache efficiency.

## Core ideas

- Organize data for how it will be read/written in hot loops
- Care about cache lines, contiguous access, batch processing
- “Performance no matter what” as a guiding stance

## Relation to other ideas

Sits beside classic OOP patterns/paradigms but intersects them — especially with ECS and locality-aware layouts.

## Related

ECS, Locality, Memory-Architecture, Optimizations
