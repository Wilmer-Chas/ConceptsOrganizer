# 1. Optimization → Shortest Path

(Dijkstra without saying “algorithm”)

## Math idea

Optimal solutions can be built from optimal subsolutions.

## Project

**“Why the obvious route isn’t shortest”**

## Setup

- 10–20 points in the plane
- Weighted edges (distance, time, cost)
- Some edges look short but are expensive

## Student task

- Try to reason the shortest path by eye
- Fail

## Math forced

- Graphs
- Path cost as a sum
- Partial ordering of paths
- Invariant: once minimal, always minimal

## Programming

- Visualize graph
- Step-by-step relaxation
- Highlight invariant preservation

## Key reveal

“We aren’t computing faster—we are preserving a proof.”
