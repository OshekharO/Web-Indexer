## 2026-09-11 - Design Tokens & Visual System Standardization

**Learning:** Hardcoded hex values, magic spacing, border radii, and background overlays in component styles can cause visual inconsistency, especially when switching between dark and light themes (e.g. image container background and floating bookmark buttons).

**Action:** Established comprehensive custom CSS variables in `:root` and `[data-bs-theme="light"]` for spacing, radius, transitions, overlays, elevation shadows, and status colors. Refactored all hardcoded values to use design tokens and added focus-visible states and reduced-motion overrides.
