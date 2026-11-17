# Spatial & Temporal Locality

## Spatial locality

Programs tend to access **nearby** addresses soon (e.g. `arr[0]`, `arr[1]`, …). Caches load lines/blocks of neighbors.

## Temporal locality

Programs tend to reuse the **same** location soon (hot variables in a loop). Caches keep recently used data.

## Difference

- Temporal = same data again  
- Spatial = nearby data next  

Analogy: keep the same book on the desk (temporal) vs keep adjacent pages handy (spatial).
