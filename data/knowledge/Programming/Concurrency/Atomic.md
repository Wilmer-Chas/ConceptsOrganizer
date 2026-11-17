# Atomic (`std::atomic`)

Provides operations on shared data that are **thread-safe** without a full mutex for simple cases — updates happen atomically so concurrent access doesn’t tear values or race on single variables.

Use when you need lock-free (or lighter) sharing of simple state; prefer mutexes/condition variables for complex critical sections.
