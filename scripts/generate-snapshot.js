const fs = require('fs');
const path = require('path');

const providersPath = path.join(__dirname, '..', 'providers.json');
const snapshotPath = path.join(__dirname, '..', 'snapshot.html');

const providers = JSON.parse(fs.readFileSync(providersPath, 'utf8'));

const CATEGORIES = [
  { id: 'manga', status: 1, title: 'Manga & Webtoons', type: 'MANGA', typeClass: 'type-manga', desc: 'Curated online manga readers, webtoons, and scanlation directories.' },
  { id: 'ln', status: 2, title: 'Light Novels', type: 'LN', typeClass: 'type-ln', desc: 'Free online light novel repositories and web novel translation readers.' },
  { id: 'movie', status: 3, title: 'Movies & TV Series', type: 'MOVIE', typeClass: 'type-movie', desc: 'Platforms for streaming movies, television series, and cinema content.' },
  { id: 'app', status: 4, title: 'Apps & Software Utilities', type: 'APP', typeClass: 'type-app', desc: 'Open-source software, Android APKs, desktop applications, and digital tools.' },
  { id: 'anime', status: 5, title: 'Anime Streaming', type: 'ANIME', typeClass: 'type-anime', desc: 'Free anime streaming platforms with subbed and dubbed options.' },
  { id: 'learning', status: 6, title: 'Learning & Educational Resources', type: 'LEARNING', typeClass: 'type-learning', desc: 'Interactive programming platforms, academic study hubs, and educational tutorials.' },
  { id: 'nsfw', status: 7, title: 'Adult Content (18+)', type: 'NSFW', typeClass: 'type-nsfw', desc: 'Mature 18+ entertainment platforms and content repositories.' }
];

const allSites = Object.keys(providers).map(key => {
  const site = providers[key];
  const cat = CATEGORIES.find(c => c.status === site.status) || {
    id: 'unknown',
    status: site.status,
    title: 'Other Resources',
    type: 'Unknown',
    typeClass: 'type-unknown'
  };
  return {
    key: key,
    name: site.name,
    url: site.url,
    status: site.status,
    icon: site.icon,
    category: cat.id,
    type: cat.type,
    typeClass: cat.typeClass
  };
});

let sectionsHtml = '';
let itemListElements = [];
let itemPosition = 1;

CATEGORIES.forEach(category => {
  const categorySites = allSites.filter(s => s.status === category.status);
  if (categorySites.length === 0) return;

  let cards = '';
  categorySites.forEach(site => {
    const icon = site.icon || 'https://imgpx.com/en/QoMXS9MOaUQY.webp';
    const nsfwBadge = site.status === 7 ? '<div class="nsfw-warning"><i class="bi bi-exclamation-triangle me-1"></i>NSFW</div>' : '';

    cards += `
        <div class="col-sm-6 col-md-4 col-lg-3">
          <div class="site-card">
            ${nsfwBadge}
            <button class="bookmark-btn" title="Add to bookmarks" aria-label="Add to bookmarks">
              <i class="bi bi-bookmark-star"></i>
            </button>
            <div class="card-img-container">
              <img class="card-thumbnail" src="${icon}" alt="${site.name} icon" loading="lazy" onerror="this.src='https://imgpx.com/en/QoMXS9MOaUQY.webp'" />
            </div>
            <div class="card-body">
              <a class="site-name" href="${site.url}" target="_blank" rel="noopener noreferrer" title="${site.key}">${site.name}</a>
              <div class="health-status health-online"><i class="bi bi-check-circle-fill"></i> Online</div>
              <span class="site-type ${site.typeClass}">${site.type}</span>
            </div>
          </div>
        </div>`;

    itemListElements.push({
      "@type": "ListItem",
      "position": itemPosition++,
      "name": site.name,
      "url": site.url
    });
  });

  sectionsHtml += `
      <section class="category-group my-5" id="cat-${category.id}">
        <div class="d-flex align-items-baseline justify-content-between border-bottom border-secondary pb-2 mb-4">
          <h2 class="h3 fw-bold mb-0">${category.title}</h2>
          <span class="badge bg-secondary">${categorySites.length} sites</span>
        </div>
        <p class="text-secondary small mb-4">${category.desc}</p>
        <div class="row g-4">
          ${cards}
        </div>
      </section>`;
});

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://indexer.moe.page/snapshot.html#webpage",
      "url": "https://indexer.moe.page/snapshot.html",
      "name": "Web Indexer — Static HTML Directory Snapshot",
      "description": `Comprehensive HTML directory snapshot listing ${allSites.length} websites across manga, light novels, movies, anime, learning resources, and applications.`,
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://indexer.moe.page/#website",
        "name": "Web Indexer",
        "url": "https://indexer.moe.page/"
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://indexer.moe.page/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Directory Snapshot",
            "item": "https://indexer.moe.page/snapshot.html"
          }
        ]
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://indexer.moe.page/snapshot.html#itemlist",
      "name": "Indexed Web Resources",
      "numberOfItems": allSites.length,
      "itemListElement": itemListElements
    }
  ]
};

const snapshotHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Web Indexer Directory Snapshot — Complete Site Listing</title>
  <meta name="description" content="Complete server-rendered directory snapshot of Web Indexer listing ${allSites.length} curated websites across manga, anime, movies, light novels, apps, and learning resources." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://indexer.moe.page/snapshot.html" />
  <link rel="alternate" type="text/html" href="https://indexer.moe.page/" title="Web Indexer Interactive Web App" />
  <meta property="og:url" content="https://indexer.moe.page/snapshot.html" />
  <meta property="og:title" content="Web Indexer Directory Snapshot — Complete Site Listing" />
  <meta property="og:description" content="Complete server-rendered directory snapshot of Web Indexer listing ${allSites.length} curated websites across manga, anime, movies, light novels, apps, and learning resources." />
  <meta property="og:image" content="https://indexer.moe.page/img/og-image.png" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Web Indexer Directory Snapshot — Complete Site Listing" />
  <meta name="twitter:description" content="Complete server-rendered directory snapshot of Web Indexer listing ${allSites.length} curated websites." />
  <meta name="twitter:image" content="https://indexer.moe.page/img/og-image.png" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" />
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #121212; color: #e9ecef; }
    .gradient-header { background: linear-gradient(135deg, #4361ee, #3a0ca3); color: white; padding: 2rem 0; }
    .site-card { background-color: #1e1e1e; border: 1px solid #444d56; border-radius: 12px; height: 100%; overflow: hidden; position: relative; }
    .card-img-container { height: 140px; display: flex; align-items: center; justify-content: center; padding: 1rem; background-color: rgba(0,0,0,0.05); border-bottom: 1px solid #444d56; }
    .card-thumbnail { max-height: 100%; max-width: 100%; border-radius: 8px; object-fit: contain; }
    .card-body { padding: 1.25rem; text-align: center; }
    .site-name { font-weight: 600; font-size: 1.1rem; margin-bottom: 0.5rem; color: #e9ecef; text-decoration: none; display: block; text-align: center; }
    .site-name:hover { color: #4361ee; }
    .site-type { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; text-align: center; margin-bottom: 0.5rem; }
    .type-manga { background-color: rgba(76,201,240,0.2); color: #4cc9f0; }
    .type-ln { background-color: rgba(248,150,30,0.2); color: #f8961e; }
    .type-movie { background-color: rgba(67,97,238,0.2); color: #4361ee; }
    .type-app { background-color: rgba(114,9,183,0.2); color: #7209b7; }
    .type-anime { background-color: rgba(247,37,133,0.2); color: #f72585; }
    .type-learning { background-color: rgba(32,201,151,0.2); color: #20c997; }
    .type-nsfw { background-color: rgba(220,53,69,0.2); color: #dc3545; }
    .type-unknown { background-color: rgba(108,117,125,0.2); color: #6c757d; }
    .health-status { font-size: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 0.5rem; color: #28a745; }
    .bookmark-btn { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: white; z-index: 10; }
    .nsfw-warning { position: absolute; top: 10px; left: 50px; background: rgba(220,53,69,0.9); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; z-index: 10; }
    footer { background-color: #1e1e1e; border-top: 1px solid #444d56; padding: 2rem 0; margin-top: 3rem; }
    .container { max-width: 1200px; }
  </style>
  <script type="application/ld+json">
${JSON.stringify(jsonLdData, null, 2)}
  </script>
</head>
<body>
  <header class="gradient-header">
    <div class="container text-center">
      <h1>Web Indexer Directory Snapshot</h1>
      <p class="lead">Complete static HTML site listing for crawlers, search engines, and accessible browsing</p>
      <p class="mb-0"><a href="https://indexer.moe.page/" class="btn btn-outline-light btn-sm"><i class="bi bi-arrow-left me-1"></i>Back to Interactive Directory</a></p>
    </div>
  </header>

  <main class="py-4">
    <div class="container">
      <div class="alert alert-info d-flex align-items-center mb-4" role="alert">
        <i class="bi bi-info-circle-fill me-2 fs-5"></i>
        <div>
          This page is a server-rendered snapshot of all <strong>${allSites.length} websites</strong> currently indexed in Web Indexer across 7 categories. It provides full crawlability without requiring JavaScript.
        </div>
      </div>
      ${sectionsHtml}
    </div>
  </main>

  <footer>
    <div class="container text-center">
      <p>Website Indexer &copy; 2026 OshekharO &middot; <a href="https://indexer.moe.page/" style="color:#e9ecef;">Interactive Web App</a> &middot; <a href="https://github.com/OshekharO/Web-Indexer" style="color:#e9ecef;">GitHub</a></p>
    </div>
  </footer>
</body>
</html>`;

fs.writeFileSync(snapshotPath, snapshotHtml, 'utf8');
console.log(`Snapshot generated: ${snapshotPath}`);
console.log(`Sites rendered: ${allSites.length}`);
