## 2026-03-29 - Debounce Search Input Handler
**Learning:** Filtering sites on every keystroke rebuilds the DOM tree and resets IntersectionObserver observers for hundreds of items continuously during search.
**Action:** Always debounce search/input handlers that trigger full list re-renders and IntersectionObserver setup.
