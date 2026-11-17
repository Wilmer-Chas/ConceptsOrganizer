# Big-O Notation

Roughly: how cost grows with input size \(n\) (time or space). “Classy” view: \(y\) ~ CPU operations vs size.

## Common time complexities

| Class | Name | Examples |
|---|---|---|
| O(1) | Constant | Array indexing |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Scan a list |
| O(n log n) | Linearithmic | Merge sort; quicksort average |
| O(n²) | Quadratic | Bubble / selection sort |
| O(2ⁿ) | Exponential | Naive combinatorial recursion |
| O(n!) | Factorial | Brute-force TSP |

## Space examples

- DFS iterative: O(h) tree height  
- Merge sort: O(n) auxiliary  
- DP tables: O(n), O(n²), …

Cheat sheet: https://www.bigocheatsheet.com/
