# Bolt ⚡ Performance & Bug Fixing Journal

## 2026-09-18 - Queue Stalls on Unmounted DOM Elements
**Learning:** In asynchronous task queues that query DOM elements by selector during task execution, missing DOM elements (e.g. removed or re-rendered cards during filter changes) can break while-loop progress if an early return statement is used instead of `continue`. Calling recursive queue processing before returning when `activeHealthChecks` was already decremented created call stack growth and early loop exits that halted processing for remaining queue items.
**Action:** Replaced early return with `continue` in `processHealthCheckQueue` so that the while loop continues draining the queue immediately for remaining queued items without recursion or halting.
