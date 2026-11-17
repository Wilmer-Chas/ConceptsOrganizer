# Fibers & Lightweight Threads

Fibers / lightweight threads usually use fewer resources than OS threads — useful for performance-heavy cooperative workloads.

Windows: `Windows.h` fiber APIs — https://learn.microsoft.com/en-us/windows/win32/procthread/fibers

## Fibers vs lightweight threads (sketch)

| | Fibers | Lightweight threads |
|---|---|---|
| Scheduling | Cooperative; app yields | Coop or preemptive depending on impl |
| Overhead | Own stack/context but very light | Varies; may share stacks / user-space schedulers |
| Preemption | Only on explicit yield | May be preempted if backed by OS threads |
