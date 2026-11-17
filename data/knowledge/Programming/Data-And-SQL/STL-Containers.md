# STL Containers / Data Structures

A **container** in C++ is a template class that stores a collection of elements. Part of the Standard Template Library (STL); abstracts memory management and gives efficient ways to store and manipulate data.

## Families

- **Sequence** (`std::vector`, `std::list`, …): you control order.
- **Associative** (`std::map`, `std::set`, …): keyed; typically ordered.
- **Unordered** (`std::unordered_map`, `std::unordered_set`, …): fast lookup, no meaningful order.
- **Adapters** (`std::stack`, `std::queue`, …): specialized interfaces over underlying containers.

## Simplified overview

| Kind | Idea |
|---|---|
| Sequence | You control order |
| Associative | Auto-sorted / keyed |
| Unordered | Fast lookup, no order |
| Adapters | Change how you interact |

References:

- https://www.youtube.com/watch?v=NrFK5W-_U5I
- https://www.scaler.com/topics/cpp/containers-in-cpp/
