# ECS — Entity-Component-System

Build complex behavior from **composition**, not deep inheritance trees.

## Pieces

- **Entities** — IDs / containers for components; little or no behavior themselves
- **Components** — data-only bags (position, velocity, health, …)
- **Systems** — logic that runs on entities matching required components

## Why

Modularity, data-driven design, and performance-friendly iteration over homogeneous component arrays (often paired with DOD).

## Related

DOD
