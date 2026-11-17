# Pimpl Idiom (Pointer to Implementation)

C++ technique: separate a class’s **public interface** from its **implementation** behind an opaque pointer.

## Why

Change private details without breaking the public header / ABI; shorter rebuilds for clients; hide heavy includes.

## Idea

Public class holds something like `std::unique_ptr<Impl>`; methods forward to `Impl`.
