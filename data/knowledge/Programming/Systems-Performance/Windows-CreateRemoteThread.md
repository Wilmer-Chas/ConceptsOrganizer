# Windows API — CreateRemoteThread

https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createremotethread

Creates a thread that runs in another process’s virtual address space — effectively injecting execution into an already-running process.

Operates in **user space** (virtual address space of the target process), not kernel space.

Use carefully: power tool for tooling/debugging/injection scenarios; security and stability implications are large.
