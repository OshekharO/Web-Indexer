# Beacon 📡 SEO Optimization & AI Search Journal

## 2026-11-01 - Client-Side Rendering Subresource Blocking & GEO Structured Readiness

**Learning:** In client-side single-page applications (CSR) that render core content dynamically from JSON files (such as `fetch('providers.json')`), a `Disallow: /*.json$` directive in `robots.txt` critically harms crawlability. Headless crawler bots like Googlebot, Bingbot, and AI agents execute JavaScript but will abide by `robots.txt` on subresource fetches, leaving them unable to load directory items and indexing only an empty shell. Furthermore, AI answer engines (AEO/GEO) heavily prioritize structured direct answers, entity linkage (`sameAs`, `knowsAbout`), freshness (`dateModified`), and crawlable static snapshot alternatives.

**Action:** Removed the `Disallow: /*.json$` restriction from `robots.txt` to permit subresource loading. Added `snapshot.html` to `sitemap.xml` with updated `lastmod` timestamps. Generated `img/og-image.png` to fix broken 404 Open Graph previews. Restructured heading hierarchies and introduced a crawler-visible Q&A Directory Guide with a connected JSON-LD graph (`WebSite`, `Organization`, `Person`, `WebApplication`, `FAQPage`, `CollectionPage`, `ItemList`) across `index.html` and `snapshot.html`.
