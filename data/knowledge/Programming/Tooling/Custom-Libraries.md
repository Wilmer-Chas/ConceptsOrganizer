# Creating Custom Libraries (C++)

Use `static` member functions when you want to call helpers without an instance — a common pattern for small utility “libraries”.

## Header (`.h`)

Declare the class/API your other files will include.

## Implementation (`.cpp`)

Define the functions. Call them through the class scope, e.g.:

```cpp
sequence::showarray();
```

Remember: include the header where you use it, and make sure both `.cpp` files are linked in the same build.
