const statusEl = document.getElementById("status");
const statusTextEl = document.getElementById("statusText");
const mainContainer = document.getElementById("siteList");
const searchInput = document.getElementById("searchInput");
let currentFilter = "all";
let allSites = [];
let filteredSites = [];
let bookmarkedSites = JSON.parse(localStorage.getItem('bookmarkedSites')) || [];
let nsfwConsent = localStorage.getItem('nsfwConsent') === 'true';
let currentSiteForActions = null;
let statusTimeout;
let healthCheckQueue = [];
let activeHealthChecks = 0;
const MAX_CONCURRENT_HEALTH_CHECKS = 5;
let healthCheckObserver = null;
let processedHealthKeys = new Set();

const DEFAULT_IMAGE = "https://imgpx.com/en/QoMXS9MOaUQY.webp";

const TYPE_MAPPING = {
  1: { type: "MANGA", typeClass: "type-manga" },
  2: { type: "LN", typeClass: "type-ln" },
  3: { type: "MOVIE", typeClass: "type-movie" },
  4: { type: "APP", typeClass: "type-app" },
  5: { type: "ANIME", typeClass: "type-anime" },
  6: { type: "LEARNING", typeClass: "type-learning" },
  7: { type: "NSFW", typeClass: "type-nsfw" }
};
const DEFAULT_TYPE = { type: "Unknown", typeClass: "type-unknown" };

const GITHUB_REPO = 'OshekharO/Web-Indexer';

function hideStatus() {
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    statusEl.classList.add('d-none');
  }, 5000);
}

function showStatus(message, type = 'danger') {
  statusTextEl.textContent = message;
  statusEl.className = `alert alert-${type} text-center mb-4`;
  statusEl.classList.remove('d-none');
  hideStatus();
}

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', function() {
  const currentTheme = document.body.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-bs-theme', newTheme);
  const icon = this.querySelector('i');
  if (newTheme === 'dark') {
    icon.className = 'bi bi-moon-stars me-2';
  } else {
    icon.className = 'bi bi-sun me-2';
  }
  localStorage.setItem('theme', newTheme);
});

// NSFW modal
const nsfwModalEl = document.getElementById('nsfwWarningModal');
const nsfwModal = new bootstrap.Modal(nsfwModalEl);

document.getElementById('confirmNsfw').addEventListener('click', function() {
  const consentCheckbox = document.getElementById('nsfwConsent');
  if (consentCheckbox.checked) {
    nsfwConsent = true;
    localStorage.setItem('nsfwConsent', 'true');
    nsfwModal.hide();
    filterAndDisplaySites(currentFilter, searchInput.value.toLowerCase());
  }
});

nsfwModalEl.addEventListener('hidden.bs.modal', function () {
  document.getElementById('nsfwConsent').checked = false;
  if (currentFilter === 'nsfw') {
    resetToAllFilter();
  }
});

// Search
searchInput.addEventListener('input', function() {
  filterAndDisplaySites(currentFilter, this.value.toLowerCase());
});

document.getElementById('clearSearch').addEventListener('click', function() {
  searchInput.value = '';
  filterAndDisplaySites(currentFilter, '');
});

// Keyboard shortcut for search
document.addEventListener('keydown', function(e) {
  if (e.key === '/' && document.activeElement !== searchInput && 
      document.activeElement.tagName !== 'INPUT' && 
      document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    searchInput.focus();
  }
});

// Filter radio buttons
document.querySelectorAll('input[name="filter"]').forEach(function(radio) {
  radio.addEventListener('change', function() {
    currentFilter = this.value;
    if (currentFilter === 'nsfw' && !nsfwConsent) {
      nsfwModal.show();
      return;
    }
    filterAndDisplaySites(currentFilter, searchInput.value.toLowerCase());
    updateMobileNavActive(currentFilter);
  });
});

function filterAndDisplaySites(typeFilter, searchFilter) {
  if (typeFilter === 'nsfw' && !nsfwConsent) {
    nsfwModal.show();
    return;
  }

  filteredSites = allSites.filter(site => {
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'bookmarked' ? bookmarkedSites.includes(site.key) : 
                       site.type.toLowerCase().includes(typeFilter));
    const matchesSearch = site.name.toLowerCase().includes(searchFilter) || 
                         site.key.toLowerCase().includes(searchFilter);
    
    const isNsfwSite = site.status === 7;
    const hideNsfw = isNsfwSite && !nsfwConsent && typeFilter !== 'nsfw';
    
    return matchesType && matchesSearch && !hideNsfw;
  });
  
  displaySites(filteredSites);
  updateStats();
}

function filterProviders() {
  const searchTerm = searchInput.value.toLowerCase();
  filterAndDisplaySites(currentFilter, searchTerm);
}

function updateMobileNavActive(filterValue) {
  document.querySelectorAll('.mobile-nav-item').forEach(function(item) {
    item.classList.toggle('active', item.getAttribute('data-filter') === filterValue);
  });
}

function resetToAllFilter() {
  document.getElementById('filter-all').checked = true;
  currentFilter = 'all';
  updateMobileNavActive('all');
  filterProviders();
}

// Mobile bottom nav
document.querySelectorAll('.mobile-nav-item').forEach(function(item) {
  item.addEventListener('click', function() {
    const filterValue = this.getAttribute('data-filter');
    const radio = document.getElementById('filter-' + filterValue);
    if (radio) {
      radio.click();
    }
  });
});

// Clear filters
const clearFiltersBtn = document.getElementById('clearFilters');
if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener('click', function() {
    searchInput.value = '';
    resetToAllFilter();
  });
}

// Bookmarks
function toggleBookmark(siteKey) {
  const index = bookmarkedSites.indexOf(siteKey);
  if (index === -1) {
    bookmarkedSites.push(siteKey);
  } else {
    bookmarkedSites.splice(index, 1);
  }
  localStorage.setItem('bookmarkedSites', JSON.stringify(bookmarkedSites));
  updateStats();
  
  const bookmarkBtn = document.querySelector(`[data-site-key="${siteKey}"]`);
  if (bookmarkBtn) {
    bookmarkBtn.classList.toggle('bookmarked', index === -1);
    bookmarkBtn.innerHTML = index === -1 ? 
      '<i class="bi bi-bookmark-star-fill"></i>' : 
      '<i class="bi bi-bookmark-star"></i>';
  }
  
  if (currentFilter === 'bookmarked') {
    filterProviders();
  }
}

// Health checks with concurrency limit and IntersectionObserver
async function checkSiteHealth(url) {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return 'online';
  } catch (error) {
    return 'offline';
  }
}

function scheduleHealthCheck(site) {
  if (processedHealthKeys.has(site.key)) return;
  processedHealthKeys.add(site.key);
  healthCheckQueue.push(site);
  processHealthCheckQueue();
}

function processHealthCheckQueue() {
  while (activeHealthChecks < MAX_CONCURRENT_HEALTH_CHECKS && healthCheckQueue.length > 0) {
    const site = healthCheckQueue.shift();
    activeHealthChecks++;
    
    const healthElement = document.querySelector(`[data-health-key="${site.key}"]`);
    if (!healthElement) {
      activeHealthChecks--;
      processHealthCheckQueue();
      return;
    }
    
    healthElement.innerHTML = '<i class="bi bi-circle-fill"></i> Checking...';
    healthElement.className = 'health-status health-checking';
    
    checkSiteHealth(site.url).then(health => {
      healthElement.innerHTML = health === 'online' ? 
        '<i class="bi bi-check-circle-fill"></i> Online' : 
        '<i class="bi bi-x-circle-fill"></i> Offline';
      healthElement.className = `health-status ${health === 'online' ? 'health-online' : 'health-offline'}`;
    }).catch(() => {
      healthElement.innerHTML = '<i class="bi bi-x-circle-fill"></i> Offline';
      healthElement.className = 'health-status health-offline';
    }).finally(() => {
      activeHealthChecks--;
      processHealthCheckQueue();
    });
  }
}

function setupHealthCheckObserver() {
  if (healthCheckObserver) {
    healthCheckObserver.disconnect();
  }
  
  healthCheckObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const healthKey = entry.target.getAttribute('data-health-key');
        if (healthKey && allSites.find(s => s.key === healthKey)) {
          const site = allSites.find(s => s.key === healthKey);
          scheduleHealthCheck(site);
        }
      }
    });
  }, {
    rootMargin: '100px'
  });
}

// Quick actions
function setupQuickActions(site) {
  const quickActionsBtn = document.createElement('button');
  quickActionsBtn.className = 'quick-actions-btn';
  quickActionsBtn.innerHTML = '<i class="bi bi-three-dots"></i>';
  quickActionsBtn.title = 'Quick Actions';
  quickActionsBtn.setAttribute('aria-label', 'Quick actions for ' + site.name);
  quickActionsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showQuickActions(site);
  });
  return quickActionsBtn;
}

function showQuickActions(site) {
  currentSiteForActions = site;
  const modal = new bootstrap.Modal(document.getElementById('quickActionsModal'));
  modal.show();
}

// Social sharing
function shareOnTwitter() {
  const text = encodeURIComponent('Web Indexer — One destination for all your favorite websites and applications');
  const url = encodeURIComponent('https://indexer.is-an.app');
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
}

function shareOnReddit() {
  const title = encodeURIComponent('Web Indexer — One destination for all your favorite websites and applications');
  const url = encodeURIComponent('https://indexer.is-an.app');
  window.open(`https://www.reddit.com/submit?title=${title}&url=${url}`, '_blank', 'width=550,height=600');
}

function shareOnTelegram() {
  const text = encodeURIComponent('Web Indexer — One destination for all your favorite websites and applications');
  const url = encodeURIComponent('https://indexer.is-an.app');
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'width=550,height=420');
}

function copyShareLink() {
  navigator.clipboard.writeText('https://indexer.is-an.app').then(() => {
    showTempAlert('Link copied to clipboard!', 'success');
  });
}

document.getElementById('shareTwitter').addEventListener('click', shareOnTwitter);
document.getElementById('shareReddit').addEventListener('click', shareOnReddit);
document.getElementById('shareTelegram').addEventListener('click', shareOnTelegram);
document.getElementById('shareCopyLink').addEventListener('click', copyShareLink);

// GitHub integration
function createGitHubIssueUrl(title, body, labels = []) {
  const baseUrl = `https://github.com/${GITHUB_REPO}/issues/new`;
  const params = new URLSearchParams({
    title: title,
    body: body,
    labels: labels.join(',')
  });
  return `${baseUrl}?${params.toString()}`;
}

function suggestNewSite(siteData) {
  const title = `[Site Suggestion] ${siteData.name}`;
  const body = `## Site Suggestion

**Site Name:** ${siteData.name}
**URL:** ${siteData.url}
**Category:** ${siteData.category}
**Icon URL:** ${siteData.icon || 'Not provided'}
**Description:** ${siteData.description || 'Not provided'}

### Content Warnings:
- Ads: ${siteData.warnings.ads ? 'Yes' : 'No'}
- Pop-ups: ${siteData.warnings.popups ? 'Yes' : 'No'}
- Registration Required: ${siteData.warnings.registration ? 'Yes' : 'No'}

### Additional Notes:
${siteData.additionalNotes || 'None'}

---

*Submitted via Website Indexer on ${new Date().toLocaleDateString()}*`;

  const issueUrl = createGitHubIssueUrl(title, body, ['site-suggestion', 'pending-review']);
  window.open(issueUrl, '_blank');
}

function reportSiteIssue(issueData) {
  const title = `[Site Issue] ${issueData.siteName ? issueData.siteName + ' - ' : ''}${issueData.type}`;
  const body = `## Site Issue Report

**Affected Site:** ${issueData.siteName || 'Not specified'}
**Issue Type:** ${issueData.type}
**Reported URL:** ${issueData.siteUrl || 'Not specified'}

### Description:
${issueData.description}

### Additional Context:
${issueData.additionalContext || 'None'}

---

*Reported via Website Indexer on ${new Date().toLocaleDateString()}*`;

  const labels = ['bug', 'site-issue'];
  if (issueData.type === 'broken') labels.push('broken-site');
  if (issueData.type === 'malware') labels.push('security');

  const issueUrl = createGitHubIssueUrl(title, body, labels);
  window.open(issueUrl, '_blank');
}

// Form handlers
document.getElementById('submitSiteSuggestion').addEventListener('click', function() {
  const form = document.getElementById('suggestSiteForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const siteData = {
    name: document.getElementById('siteName').value,
    url: document.getElementById('siteUrl').value,
    category: document.getElementById('siteCategory').value,
    icon: document.getElementById('siteIcon').value,
    description: document.getElementById('siteDescription').value,
    warnings: {
      ads: document.getElementById('warningAds').checked,
      popups: document.getElementById('warningPopups').checked,
      registration: document.getElementById('warningRegistration').checked
    }
  };

  suggestNewSite(siteData);
  const suggestModal = bootstrap.Modal.getInstance(document.getElementById('suggestSiteModal'));
  suggestModal.hide();
  form.reset();
});

document.getElementById('submitIssueReport').addEventListener('click', function() {
  const form = document.getElementById('reportIssueForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const selectedSite = document.getElementById('issueSite').value;
  const siteData = allSites.find(site => site.key === selectedSite);

  const issueData = {
    siteName: siteData ? siteData.name : 'Not specified',
    siteUrl: siteData ? siteData.url : 'Not specified',
    type: document.getElementById('issueType').value,
    description: document.getElementById('issueDescription').value
  };

  reportSiteIssue(issueData);
  const reportModal = bootstrap.Modal.getInstance(document.getElementById('reportIssueModal'));
  reportModal.hide();
  form.reset();
});

// Quick actions handlers
document.getElementById('actionCopyUrl').addEventListener('click', function() {
  if (currentSiteForActions) {
    navigator.clipboard.writeText(currentSiteForActions.url).then(() => {
      showTempAlert('URL copied to clipboard!', 'success');
    });
    const qaModal = bootstrap.Modal.getInstance(document.getElementById('quickActionsModal'));
    qaModal.hide();
  }
});

document.getElementById('actionOpenNewTab').addEventListener('click', function() {
  if (currentSiteForActions) {
    window.open(currentSiteForActions.url, '_blank');
    const qaModal = bootstrap.Modal.getInstance(document.getElementById('quickActionsModal'));
    qaModal.hide();
  }
});

document.getElementById('actionToggleBookmark').addEventListener('click', function() {
  if (currentSiteForActions) {
    toggleBookmark(currentSiteForActions.key);
    const qaModal = bootstrap.Modal.getInstance(document.getElementById('quickActionsModal'));
    qaModal.hide();
  }
});

document.getElementById('actionReportSite').addEventListener('click', function() {
  if (currentSiteForActions) {
    const qaModal = bootstrap.Modal.getInstance(document.getElementById('quickActionsModal'));
    qaModal.hide();
    document.getElementById('issueSite').value = currentSiteForActions.key;
    const reportModal = new bootstrap.Modal(document.getElementById('reportIssueModal'));
    reportModal.show();
  }
});

// Utilities
function showTempAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show temp-alert`;
  alert.setAttribute('role', 'alert');
  alert.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
  document.body.appendChild(alert);
  
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove();
    }
  }, 3000);
}

function populateIssueSiteDropdown() {
  const select = document.getElementById('issueSite');
  select.innerHTML = '<option value="">Select site...</option>';
  
  allSites.forEach(site => {
    const option = document.createElement('option');
    option.value = site.key;
    option.textContent = site.name;
    select.appendChild(option);
  });
}

function displaySites(sites) {
  mainContainer.innerHTML = '';
  processedHealthKeys.clear();
  healthCheckQueue = [];
  activeHealthChecks = 0;
  
  if (sites.length === 0) {
    document.getElementById('noResults').classList.remove('d-none');
    const noResultsTitle = document.querySelector('#noResults h3');
    const noResultsDesc = document.querySelector('#noResults p');
    if (currentFilter === 'bookmarked') {
      noResultsTitle.textContent = 'No bookmarked websites';
      noResultsDesc.textContent = 'Click the bookmark icon on any site to save it here';
    } else if (currentFilter !== 'all') {
      noResultsTitle.textContent = 'No websites found';
      noResultsDesc.textContent = `No results found for "${currentFilter}" category. Try a different filter.`;
    } else {
      noResultsTitle.textContent = 'No websites found';
      noResultsDesc.textContent = 'Try adjusting your search or filter criteria';
    }
    return;
  }
  
  document.getElementById('noResults').classList.add('d-none');
  
  const fragment = document.createDocumentFragment();
  const bookmarkSet = new Set(bookmarkedSites);
  
  sites.forEach(site => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3 fade-in";
    
    const card = document.createElement("div");
    card.className = "site-card";
    
    const quickActionsBtn = setupQuickActions(site);
    card.appendChild(quickActionsBtn);
    
    const isBookmarked = bookmarkSet.has(site.key);
    const bookmarkBtn = document.createElement("button");
    bookmarkBtn.className = `bookmark-btn${isBookmarked ? ' bookmarked' : ''}`;
    bookmarkBtn.setAttribute('data-site-key', site.key);
    bookmarkBtn.innerHTML = isBookmarked ? 
      '<i class="bi bi-bookmark-star-fill"></i>' : 
      '<i class="bi bi-bookmark-star"></i>';
    bookmarkBtn.title = isBookmarked ? 'Remove bookmark' : 'Add to bookmarks';
    bookmarkBtn.setAttribute('aria-label', isBookmarked ? 'Remove bookmark' : 'Add to bookmarks');
    bookmarkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleBookmark(site.key);
    });
    
    card.appendChild(bookmarkBtn);
    
    if (site.status === 7) {
      const nsfwBadge = document.createElement("div");
      nsfwBadge.className = "nsfw-warning";
      nsfwBadge.innerHTML = '<i class="bi bi-exclamation-triangle me-1"></i>NSFW';
      card.appendChild(nsfwBadge);
    }
    
    const cardImgContainer = document.createElement("div");
    cardImgContainer.className = "card-img-container";
    
    const img = document.createElement("img");
    img.className = "card-thumbnail";
    img.src = site.icon || DEFAULT_IMAGE;
    img.alt = site.name + " icon";
    img.loading = "lazy";
    
    img.onerror = function () {
      this.src = DEFAULT_IMAGE;
    };
    
    cardImgContainer.appendChild(img);
    card.appendChild(cardImgContainer);
    
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";
    
    const siteName = document.createElement("a");
    siteName.className = "site-name";
    siteName.href = site.url;
    siteName.target = "_blank";
    siteName.title = site.key;
    siteName.textContent = site.name;
    siteName.setAttribute('rel', 'noopener noreferrer');
    
    cardBody.appendChild(siteName);
    
    const healthStatus = document.createElement("div");
    healthStatus.className = "health-status health-checking";
    healthStatus.setAttribute('data-health-key', site.key);
    healthStatus.innerHTML = '<i class="bi bi-circle-fill"></i> Checking...';
    
    cardBody.appendChild(healthStatus);
    
    const typeBadge = document.createElement("span");
    typeBadge.className = "site-type " + site.typeClass;
    typeBadge.textContent = site.type;
    
    cardBody.appendChild(typeBadge);
    card.appendChild(cardBody);
    col.appendChild(card);
    fragment.appendChild(col);
    
    // Observe health status elements for lazy health checks
    const healthEl = cardBody.querySelector('[data-health-key]');
    if (healthEl && healthCheckObserver) {
      healthCheckObserver.observe(healthEl);
    }
  });
  
  mainContainer.appendChild(fragment);
  
  // Initial check for any elements already in view
  setTimeout(() => {
    processHealthCheckQueue();
  }, 100);
}

function updateStats() {
  const total = allSites.length;
  const bookmarks = bookmarkedSites.length;
  
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  for (let i = 0; i < allSites.length; i++) {
    const statusCode = allSites[i].status;
    if (counts.hasOwnProperty(statusCode)) {
      counts[statusCode]++;
    }
  }
  
  document.getElementById('totalCount').textContent = total;
  document.getElementById('mangaCount').textContent = counts[1];
  document.getElementById('lnCount').textContent = counts[2];
  document.getElementById('movieCount').textContent = counts[3];
  document.getElementById('appCount').textContent = counts[4];
  document.getElementById('animeCount').textContent = counts[5];
  document.getElementById('learningCount').textContent = counts[6];
  document.getElementById('nsfwCount').textContent = counts[7];
  document.getElementById('bookmarkCount').textContent = bookmarks;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-bs-theme', savedTheme);
  
  const icon = document.querySelector('#themeToggle i');
  if (savedTheme === 'dark') {
    icon.className = 'bi bi-moon-stars me-2';
  } else {
    icon.className = 'bi bi-sun me-2';
  }

  // Scroll to top button
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    });
    
    scrollToTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const skeletonList = document.getElementById('skeletonList');
  const skeletonFragment = document.createDocumentFragment();
  for (let i = 0; i < 8; i++) {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4 col-lg-3';
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    const img = document.createElement('div');
    img.className = 'skeleton-img';
    const body = document.createElement('div');
    body.className = 'skeleton-body';
    const lineTitle = document.createElement('div');
    lineTitle.className = 'skeleton-line skeleton-title';
    const lineSub = document.createElement('div');
    lineSub.className = 'skeleton-line skeleton-subtitle';
    const lineBadge = document.createElement('div');
    lineBadge.className = 'skeleton-line skeleton-badge';
    body.appendChild(lineTitle);
    body.appendChild(lineSub);
    body.appendChild(lineBadge);
    card.appendChild(img);
    card.appendChild(body);
    col.appendChild(card);
    skeletonFragment.appendChild(col);
  }
  skeletonList.appendChild(skeletonFragment);

  setupHealthCheckObserver();

  // Load sites
  fetch('https://raw.githack.com/OshekharO/Web-Indexer/main/providers.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      allSites = Object.keys(data).map(key => {
        const site = data[key];
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
      
      filteredSites = [...allSites];
      filterAndDisplaySites(currentFilter, '');
      updateStats();
      populateIssueSiteDropdown();
      
      document.getElementById('skeletonList').classList.add('d-none');
    })
    .catch(error => {
      console.error("Failed to load sites:", error);
      document.getElementById('skeletonList').classList.add('d-none');
      showStatus('Failed to load the site directory. Please check your internet connection and try again.', 'danger');
    });
});
