# Memory Allocation Tracking (C++)

Reference: https://www.youtube.com/watch?v=sLlGEUO_EGE

## Override `new` / `delete` for visibility

Put tracking overrides early so they apply broadly (including some smart-pointer paths):

```cpp
void* operator new(size_t size) {
  std::cout << "Allocating " << size << " bytes\n";
  return malloc(size);
}

void operator delete(void* memory, size_t size) {
  std::cout << "Freeing " << size << " bytes\n";
  free(memory);
}
```

## Metrics struct

```cpp
struct AllocationMetrics {
  uint32_t TotalAllocated = 0;
  uint32_t TotalFreed = 0;
  uint32_t CurrentUsage() { return TotalAllocated - TotalFreed; }
};

static AllocationMetrics s_AllocationMetrics;

static void PrintMemoryUsage() {
  std::cout << "Memory Usage: "
            << s_AllocationMetrics.CurrentUsage() << " bytes\n";
}
```

Bump `TotalAllocated` / `TotalFreed` inside the operator overrides when you want running totals instead of only console spam.
