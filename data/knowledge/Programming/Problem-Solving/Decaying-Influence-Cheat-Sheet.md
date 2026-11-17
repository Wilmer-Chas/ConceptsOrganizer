# Cheat Sheet: Decaying Influence / Component Locations

How to deduce component locations in a decaying-influence system.

1. **Know** slots, decay rate, traversal order, observed values \(y_j\), influence pattern.  
2. **Model** — each component contributes to all slots; strongest at its own slot; neighbors decay with distance.  
3. **Peaks** — components peak in their own slot; scan local maxima as candidates.  
4. **Overlap** — high slots may be sums of nearby components.  
5. **Equations (optional)** — observed ≈ Σ component × decay^distance.  
6. **Solve** — start at strongest peak (value ≤ 1); subtract influence; next residual peak.  
7. **Feasibility** — values in 0–1; adjust if not.  
8. **Refine** — iterate residuals for hidden components.  
9. **Sparsity** — fewer components → unique solutions easier.  
10. **Verify** — reconstruct observations.  
11. **Advanced** — linear system \(y = Av\) with constraints; optimize for sparsity.  
12. **Conclude** — high slots ≈ components; neighbors ≈ influence; uniqueness may fail under heavy overlap.
