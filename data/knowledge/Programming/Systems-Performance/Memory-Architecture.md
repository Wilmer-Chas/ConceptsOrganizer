# Memory Architecture

Layers (slow → fast, large → small):

1. **Secondary storage** — SSD / HDD  
2. **Primary** — RAM  
3. **Cache** — L1 / L2 / L3  
4. **Registers** — values the thread works on directly  

Understanding this hierarchy motivates locality-friendly code and cache-aware layouts.
