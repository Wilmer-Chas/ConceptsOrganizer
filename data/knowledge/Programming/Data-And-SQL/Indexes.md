# Indexes

An index turns many lookups from **scan everything** into **narrow the search**. For a sorted key, that is roughly **O(N) → O(log N)** — each step throws away a large chunk of candidates instead of checking every row.

## Mental model: binary search

Imagine 100 IDs and you want one of them.

Without an index, the engine may walk row by row (**O(N)**).

With a sorted structure, the first probe can land near the middle (e.g. 50):

- target lower → keep the left half  
- target higher → keep the right half  

Next probe might be ~25 or ~75, then ~13, and so on. Each comparison **cuts the remaining space**, so the number of steps grows with **log N**, not N.

That “look at the middle, decide higher/lower, cut again” picture is the right *intuition* for why indexes are logarithmic.

## What databases actually use: B-trees

Real indexes are usually **B-trees** (or B+ trees), not a single mid-point binary search on a flat list.

A node holds **several ordered keys** and child pointers for the ranges between them. Example intuition at one node with keys `40` and `60`:

- value **&lt; 40** → go left  
- value **between 40 and 60** → go middle  
- value **&gt; 60** → go right  

You still discard large ranges per step, so depth stays **O(log N)** — but each level can branch more than two ways, which keeps the tree **short and disk-friendly** (few page reads).

So: binary search explains *why* it is log N; B-trees are *how* databases do that under real storage and large tables.

## Practical takeaway

- Index columns you **filter / join / order by** often.  
- Primary keys are typically indexed already.  
- Indexes speed reads; they cost **write** work and space (structure must stay in sync).  
- Wrong or unused indexes help little — measure with query plans when unsure.

Related: Cpp-And-SQLite, Algorithms/Big-O, Algorithms/Sorting-Searching
