var status = document.getElementById("status");
var statusText = document.getElementById("statusText");
var mainContainer = document.getElementById("siteList");
var filter = "all";
var allSites = [];
var filteredSites = [];
var bookmarkedSites = JSON.parse(localStorage.getItem('bookmarkedSites')) || [];
var nsfwConsent = localStorage.getItem('nsfwConsent') === 'true';

// Default image URL
const DEFAULT_IMAGE = "https://imgpx.com/en/QoMXS9MOaUQY.webp";

// Status codes and their corresponding types
const STATUS_TYPES = {
  1: { type: "MANGA", typeClass: "type-manga" },
  2: { type: "LN", typeClass: "type-ln" },
  3: { type: "MOVIE", typeClass: "type-movie" },
  4: { type: "APP", typeClass: "type-app" },
  5: { type: "ANIME", typeClass: "type-anime" },
  6: { type: "LEARNING", typeClass: "type-learning" },
  7: { type: "NSFW", typeClass: "type-nsfw" }
};

// GitHub Integration System
const GITHUB_REPO = 'OshekharO/Web-Indexer';
let currentSiteForActions = null;

// Auto-hide status after timeout
let statusTimeout;

function hideStatus() {
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    status.style.display = 'none';
  }, 5000);
}

// Theme toggle functionality
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

// Load saved theme preference
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-bs-theme', savedTheme);
  
  const icon = document.querySelector('#themeToggle i');
  if (savedTheme === 'dark') {
    icon.className = 'bi bi-moon-stars me-2';
  } else {
    icon.className = 'bi bi-sun me-2';
  }
});

// NSFW Consent functionality
document.getElementById('confirmNsfw').addEventListener('click', function() {
  const consentCheckbox = document.getElementById('nsfwConsent');
  if (consentCheckbox.checked) {
    nsfwConsent = true;
    localStorage.setItem('nsfwConsent', 'true');
    $('#nsfwWarningModal').modal('hide');
    filterAndDisplaySites(filter, document.getElementById('searchInput').value.toLowerCase());
  }
});

// Reset NSFW consent when modal is closed without consent
$('#nsfwWarningModal').on('hidden.bs.modal', function () {
  document.getElementById('nsfwConsent').checked = false;
  if (filter === 'nsfw') {
    document.getElementById('filter-all').checked = true;
    filter = 'all';
    filterProviders();
  }
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  filterAndDisplaySites(filter, searchTerm);
});

document.getElementById('clearSearch').addEventListener('click', function() {
  document.getElementById('searchInput').value = '';
  filterAndDisplaySites(filter, '');
});

function filterAndDisplaySites(typeFilter, searchFilter) {
  if (typeFilter === 'nsfw' && !nsfwConsent) {
    $('#nsfwWarningModal').modal('show');
    return;
  }
  
  filteredSites = allSites.filter(site => {
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'bookmarked' ? bookmarkedSites.includes(site.key) : 
                       site.type.toLowerCase().includes(typeFilter));
    const matchesSearch = site.name.toLowerCase().includes(searchFilter) || 
                         site.key.toLowerCase().includes(searchFilter);
    
    const isNsfwSite = site.status === 7;
    const showNsfw = typeFilter === 'nsfw' && nsfwConsent;
    const hideNsfw = isNsfwSite && !nsfwConsent && typeFilter !== 'nsfw';
    
    return matchesType && matchesSearch && !hideNsfw;
  });
  
  displaySites(filteredSites);
  updateStats();
}

function filterProviders() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  filterAndDisplaySites(filter, searchTerm);
}

$("input[name='filter']").on("change", function () {
  filter = this.value;
  filterProviders();
});

// Bookmark functionality
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
  
  if (filter === 'bookmarked') {
    filterProviders();
  }
}

// Site health check
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

async function updateSiteHealth(site) {
  const healthElement = document.querySelector(`[data-health-key="${site.key}"]`);
  if (healthElement) {
    healthElement.innerHTML = '<i class="bi bi-circle-fill"></i> Checking...';
    healthElement.className = 'health-status health-checking';
    
    const health = await checkSiteHealth(site.url);
    healthElement.innerHTML = health === 'online' ? 
      '<i class="bi bi-check-circle-fill"></i> Online' : 
      '<i class="bi bi-x-circle-fill"></i> Offline';
    healthElement.className = `health-status ${health === 'online' ? 'health-online' : 'health-offline'}`;
  }
}

// Quick Actions System
function setupQuickActions(site) {
  const quickActionsBtn = document.createElement('button');
  quickActionsBtn.className = 'quick-actions-btn';
  quickActionsBtn.innerHTML = '<i class="bi bi-three-dots"></i>';
  quickActionsBtn.title = 'Quick Actions';
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

// GitHub Issue Creation
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
  const body = `
## Site Suggestion

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

*Submitted via Website Indexer on ${new Date().toLocaleDateString()}*
  `.trim();

  const issueUrl = createGitHubIssueUrl(title, body, ['site-suggestion', 'pending-review']);
  window.open(issueUrl, '_blank');
}

function reportSiteIssue(issueData) {
  const title = `[Site Issue] ${issueData.siteName ? issueData.siteName + ' - ' : ''}${issueData.type}`;
  const body = `
## Site Issue Report

**Affected Site:** ${issueData.siteName || 'Not specified'}
**Issue Type:** ${issueData.type}
**Reported URL:** ${issueData.siteUrl || 'Not specified'}

### Description:
${issueData.description}

### Additional Context:
${issueData.additionalContext || 'None'}

---

*Reported via Website Indexer on ${new Date().toLocaleDateString()}*
  `.trim();

  const labels = ['bug', 'site-issue'];
  if (issueData.type === 'broken') labels.push('broken-site');
  if (issueData.type === 'malware') labels.push('security');

  const issueUrl = createGitHubIssueUrl(title, body, labels);
  window.open(issueUrl, '_blank');
}

// Form Handlers
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
  $('#suggestSiteModal').modal('hide');
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
  $('#reportIssueModal').modal('hide');
  form.reset();
});

// Quick Actions Handlers
document.getElementById('actionCopyUrl').addEventListener('click', function() {
  if (currentSiteForActions) {
    navigator.clipboard.writeText(currentSiteForActions.url).then(() => {
      showTempAlert('URL copied to clipboard!', 'success');
    });
    $('#quickActionsModal').modal('hide');
  }
});

document.getElementById('actionOpenNewTab').addEventListener('click', function() {
  if (currentSiteForActions) {
    window.open(currentSiteForActions.url, '_blank');
    $('#quickActionsModal').modal('hide');
  }
});

document.getElementById('actionToggleBookmark').addEventListener('click', function() {
  if (currentSiteForActions) {
    toggleBookmark(currentSiteForActions.key);
    $('#quickActionsModal').modal('hide');
  }
});

document.getElementById('actionReportSite').addEventListener('click', function() {
  if (currentSiteForActions) {
    $('#quickActionsModal').modal('hide');
    document.getElementById('issueSite').value = currentSiteForActions.key;
    $('#reportIssueModal').modal('show');
  }
});

// Utility Functions
function showTempAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show temp-alert`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
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
  
  if (sites.length === 0) {
    document.getElementById('noResults').classList.remove('d-none');
    return;
  }
  
  document.getElementById('noResults').classList.add('d-none');
  
  sites.forEach(site => {
    var col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3 fade-in";
    
    var card = document.createElement("div");
    card.className = "site-card";
    
    // Create quick actions button
    const quickActionsBtn = setupQuickActions(site);
    card.appendChild(quickActionsBtn);
    
    // Create bookmark button
    var bookmarkBtn = document.createElement("button");
    bookmarkBtn.className = `bookmark-btn ${bookmarkedSites.includes(site.key) ? 'bookmarked' : ''}`;
    bookmarkBtn.setAttribute('data-site-key', site.key);
    bookmarkBtn.innerHTML = bookmarkedSites.includes(site.key) ? 
      '<i class="bi bi-bookmark-star-fill"></i>' : 
      '<i class="bi bi-bookmark-star"></i>';
    bookmarkBtn.title = bookmarkedSites.includes(site.key) ? 'Remove bookmark' : 'Add to bookmarks';
    bookmarkBtn.addEventListener('click', () => toggleBookmark(site.key));
    
    card.appendChild(bookmarkBtn);
    
    // Add NSFW warning badge if applicable
    if (site.status === 7) {
      var nsfwBadge = document.createElement("div");
      nsfwBadge.className = "nsfw-warning";
      nsfwBadge.innerHTML = '<i class="bi bi-exclamation-triangle me-1"></i>NSFW';
      card.appendChild(nsfwBadge);
    }
    
    // Create card image container
    var cardImgContainer = document.createElement("div");
    cardImgContainer.className = "card-img-container";
    
    // Create image
    var img = document.createElement("img");
    img.className = "card-thumbnail";
    img.src = site.icon || DEFAULT_IMAGE;
    img.alt = site.name + " icon";
    img.loading = "lazy";
    
    img.onerror = function () {
      this.src = DEFAULT_IMAGE;
    };
    
    cardImgContainer.appendChild(img);
    card.appendChild(cardImgContainer);
    
    // Create card body
    var cardBody = document.createElement("div");
    cardBody.className = "card-body";
    
    // Create site name link
    var siteName = document.createElement("a");
    siteName.className = "site-name";
    siteName.href = site.url;
    siteName.target = "_blank";
    siteName.title = site.key;
    siteName.textContent = site.name;
    
    cardBody.appendChild(siteName);
    
    // Create health status
    var healthStatus = document.createElement("div");
    healthStatus.className = "health-status health-checking";
    healthStatus.setAttribute('data-health-key', site.key);
    healthStatus.innerHTML = '<i class="bi bi-circle-fill"></i> Checking...';
    
    cardBody.appendChild(healthStatus);
    
    // Create site type badge
    var typeBadge = document.createElement("span");
    typeBadge.className = "site-type " + site.typeClass;
    typeBadge.textContent = site.type;
    
    cardBody.appendChild(typeBadge);
    card.appendChild(cardBody);
    col.appendChild(card);
    mainContainer.appendChild(col);
    
    // Check site health after a short delay
    setTimeout(() => updateSiteHealth(site), Math.random() * 2000);
  });
}

function updateStats() {
  const total = allSites.length;
  const manga = allSites.filter(site => site.status === 1).length;
  const ln = allSites.filter(site => site.status === 2).length;
  const movie = allSites.filter(site => site.status === 3).length;
  const app = allSites.filter(site => site.status === 4).length;
  const anime = allSites.filter(site => site.status === 5).length;
  const learning = allSites.filter(site => site.status === 6).length;
  const nsfw = allSites.filter(site => site.status === 7).length;
  const bookmarks = bookmarkedSites.length;
  
  document.getElementById('totalCount').textContent = total;
  document.getElementById('mangaCount').textContent = manga;
  document.getElementById('lnCount').textContent = ln;
  document.getElementById('movieCount').textContent = movie;
  document.getElementById('appCount').textContent = app;
  document.getElementById('animeCount').textContent = anime;
  document.getElementById('learningCount').textContent = learning;
  document.getElementById('nsfwCount').textContent = nsfw;
  document.getElementById('bookmarkCount').textContent = bookmarks;
}

$(document).ready(function () {
  hideStatus();
  
  $.getJSON("https://raw.githack.com/OshekharO/Web-Indexer/main/providers.json", function (data) {
    statusText.textContent = "Parsing websites...";
    
    allSites = Object.keys(data).map(key => {
      const site = data[key];
      const statusInfo = STATUS_TYPES[site.status] || { type: "Unknown", typeClass: "type-unknown" };
      
      return {
        key: key,
        name: site.name,
        url: site.url,
        status: site.status,
        icon: site.icon,
        type: statusInfo.type,
        typeClass: statusInfo.typeClass
      };
    });
    
    filteredSites = [...allSites];
    filterAndDisplaySites(filter, '');
    updateStats();
    populateIssueSiteDropdown();
    
    statusText.textContent = `All ${allSites.length} sites loaded successfully!`;
    status.className = "alert alert-success text-center mb-4";
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }).fail(function () {
    console.log("An error has occurred.");
    statusText.textContent = "Error occurred while loading sites!";
    status.className = "alert alert-danger text-center mb-4";
    hideStatus();
  });
});
