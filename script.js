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

// Auto-hide status after timeout
let statusTimeout;

function hideStatus() {
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    status.style.display = 'none';
  }, 5000); // Hide after 5 seconds if not already hidden
}

// Theme toggle functionality
document.getElementById('themeToggle').addEventListener('click', function() {
  const currentTheme = document.body.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-bs-theme', newTheme);
  
  // Update icon and text
  const icon = this.querySelector('i');
  if (newTheme === 'dark') {
    icon.className = 'bi bi-moon-stars me-2';
  } else {
    icon.className = 'bi bi-sun me-2';
  }
  
  // Save preference to localStorage
  localStorage.setItem('theme', newTheme);
});

// Load saved theme preference
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-bs-theme', savedTheme);
  
  // Update icon based on saved theme
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
    filterAndDisplaySites('nsfw', '');
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
  // Check for NSFW filter without consent
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
    return matchesType && matchesSearch;
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
  
  // Update bookmark button state
  const bookmarkBtn = document.querySelector(`[data-site-key="${siteKey}"]`);
  if (bookmarkBtn) {
    bookmarkBtn.classList.toggle('bookmarked', index === -1);
    bookmarkBtn.innerHTML = index === -1 ? 
      '<i class="bi bi-bookmark-star-fill"></i>' : 
      '<i class="bi bi-bookmark-star"></i>';
  }
  
  // Refresh display if we're on bookmarks filter
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

function displaySites(sites) {
  mainContainer.innerHTML = '';
  
  if (sites.length === 0) {
    document.getElementById('noResults').classList.remove('d-none');
    return;
  }
  
  document.getElementById('noResults').classList.add('d-none');
  
  sites.forEach(site => {
    // Create column for card
    var col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3 fade-in";
    
    // Create card
    var card = document.createElement("div");
    card.className = "site-card";
    
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
    if (site.status === 7) { // NSFW
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
  hideStatus(); // Start the auto-hide timer
  
  $.getJSON("https://raw.githack.com/OshekharO/Web-Indexer/main/providers.json", function (data) {
    statusText.textContent = "Parsing websites...";
    
    // Convert object to array and add additional properties
    allSites = Object.keys(data).map(key => {
      const site = data[key];
      let type = "Unknown";
      let typeClass = "type-unknown";
      
      switch (site.status) {
        case 1:
          type = "MANGA";
          typeClass = "type-manga";
          break;
        case 2:
          type = "LN";
          typeClass = "type-ln";
          break;
        case 3:
          type = "MOVIE";
          typeClass = "type-movie";
          break;
        case 4:
          type = "APP";
          typeClass = "type-app";
          break;
        case 5:
          type = "ANIME";
          typeClass = "type-anime";
          break;
        case 6:
          type = "LEARNING";
          typeClass = "type-learning";
          break;
        case 7:
          type = "NSFW";
          typeClass = "type-nsfw";
          break;
      }
      
      return {
        key: key,
        name: site.name,
        url: site.url,
        status: site.status,
        icon: site.icon,
        type: type,
        typeClass: typeClass
      };
    });
    
    // Initial display
    filteredSites = [...allSites];
    displaySites(filteredSites);
    updateStats();
    
    statusText.textContent = `All ${allSites.length} sites loaded successfully!`;
    status.className = "alert alert-success text-center mb-4";
    
    // Hide status after success
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
