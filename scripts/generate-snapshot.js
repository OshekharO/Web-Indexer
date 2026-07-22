const fs = require('fs');
const path = require('path');

const providersPath = path.join(__dirname, '..', 'providers.json');
const snapshotPath = path.join(__dirname, '..', 'snapshot.html');

const providers = JSON.parse(fs.readFileSync(providersPath, 'utf8'));

const TYPE_MAPPING = {
  1: { type: 'MANGA', typeClass: 'type-manga' },
  2: { type: 'LN', typeClass: 'type-ln' },
  3: { type: 'MOVIE', typeClass: 'type-movie' },
  4: { type: 'APP', typeClass: 'type-app' },
  5: { type: 'ANIME', typeClass: 'type-anime' },
  6: { type: 'LEARNING', typeClass: 'type-learning' },
  7: { type: 'NSFW', typeClass: 'type-nsfw' }
};
const DEFAULT_TYPE = { type: 'Unknown', typeClass: 'type-unknown' };

const sites = Object.keys(providers).map(key => {
  const site = providers[key];
  const typeInfo = TYPE_MAPPING[site.status] || DEFAULT_TYPE;
  return {
    key: key,
    name: site.name,
    url: site.url,
    status: site.status,
    icon: site.icon,
    type: typeInfo.type,
    typeClass: typeInfo.typeClass
  };
});

let cardsHtml = '';
sites.forEach(site => {
  const icon = site.icon || 'https://imgpx.com/en/QoMXS9MOaUQY.webp';
  const nsfwBadge = site.status === 7 ? '<div class="nsfw-warning"><i class="bi bi-exclamation-triangle me-1"></i>NSFW</div>' : '';
  
  cardsHtml += `
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
});

const snapshotHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Web Indexer — Manga, Anime, Movies & Apps Directory</title>
  <meta name="description" content="A comprehensive directory of websites for manga, light novels, movies, anime, learning resources, and apps." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://indexer.is-an.app/" />
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
</head>
<body>
  <header class="gradient-header">
    <div class="container text-center">
      <h1>Web Indexer</h1>
      <p class="lead">One destination for all your favorite websites and applications</p>
    </div>
  </header>

  <main class="py-4">
    <div class="container">
      <div class="row g-4">
        ${cardsHtml}
      </div>
    </div>
  </main>

  <footer>
    <div class="container text-center">
      <p>Website Indexer © 2026 OshekharO</p>
      <p><a href="https://github.com/OshekharO/Web-Indexer" style="color:#e9ecef;">GitHub</a></p>
    </div>
  </footer>
</body>
</html>`;

fs.writeFileSync(snapshotPath, snapshotHtml, 'utf8');
console.log(`Snapshot generated: ${snapshotPath}`);
console.log(`Sites rendered: ${sites.length}`);
