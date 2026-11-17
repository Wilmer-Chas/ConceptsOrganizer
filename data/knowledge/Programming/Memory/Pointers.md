# Pointers — Void Pointers

**Void pointers** have no associated data type: they can point at any type and must be typecast before dereference.

## Idea

1. Store an address as `void*`.
2. Cast to the real type before reading/writing through it.

Useful for generic C-style APIs; prefer typed pointers / templates / `std::any` / variants when you control the design.
