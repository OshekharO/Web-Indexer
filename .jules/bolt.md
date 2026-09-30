## 2026-03-29 - Debounce Search Input Handler
**Learning:** Filtering sites on every keystroke rebuilds the DOM tree and resets IntersectionObserver observers for hundreds of items continuously during search.
**Action:** Always debounce search/input handlers that trigger full list re-renders and IntersectionObserver setup.

## 2026-03-30 - Map-backed Concurrency Queue & Active Abort Controller Tracking
**Learning:** Managing async concurrency with an integer counter (e.g., `activeHealthChecks++`/`--`) is prone to state corruption if active jobs are cancelled or reset without waiting for their in-flight `.finally()` handlers to settle.
**Action:** Drive concurrency bounds off `activeAbortControllers.size` rather than a separate counter variable, and verify `activeAbortControllers.get(key) === controller` in promise resolution handlers before touching state or spawning new queue items.
