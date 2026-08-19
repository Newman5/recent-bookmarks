// Use chrome API with browser fallback for Firefox compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// State management
let allBookmarks = [];
let filteredBookmarks = [];
let currentSettings = {
  theme: 'auto',
  dateRange: 14,
  bookmarkLimit: 200,
};

// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
  // Load settings
  await loadSettings();
  
  // Apply theme
  applyTheme();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load and display bookmarks
  await loadBookmarks();
});

// Load settings from storage
async function loadSettings() {
  return new Promise((resolve) => {
    browserAPI.storage.local.get(['theme', 'dateRange', 'bookmarkLimit'], (result) => {
      // Ensure result is an object
      result = result || {};
      currentSettings = {
        theme: result.theme || 'auto',
        dateRange: result.dateRange || 14,
        bookmarkLimit: result.bookmarkLimit || 200,
      };

      // Set the date range select value
      const dateRangeSelect = document.getElementById('date-range');
      if (dateRangeSelect) {
        dateRangeSelect.value = currentSettings.dateRange;
      }

      resolve();
    });
  });
}

// Save settings to storage
async function saveSettings() {
  return new Promise((resolve) => {
    browserAPI.storage.local.set(currentSettings, () => {
      console.log('Settings saved');
      resolve();
    });
  });
}

// Apply theme based on settings
function applyTheme() {
  let theme = currentSettings.theme;
  
  // Auto theme detection
  if (theme === 'auto') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  document.documentElement.setAttribute('data-theme', theme);
}

// Toggle theme
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Save preference
  currentSettings.theme = newTheme;
  saveSettings();
}

// Setup event listeners
function setupEventListeners() {
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', toggleTheme);
  
  // Search input
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', handleSearch);
  
  // Date range filter
  const dateRangeSelect = document.getElementById('date-range');
  dateRangeSelect.addEventListener('change', handleDateRangeChange);
}

async function getFolderDisplayPath(parentId) {
  try {
    const [parent] = await browserAPI.bookmarks.get(parentId);

    if (!parent) {
      return '';
    }

    const parts = [parent.title];

    if (parent.parentId) {
      const [grandparent] = await browserAPI.bookmarks.get(parent.parentId);

      if (grandparent?.title) {
        parts.unshift(grandparent.title);
      }
    }

    return parts.join(' / ');
  } catch (error) {
    console.warn('Unable to determine bookmark folder path:', error);
    return '';
  }
}

// Load bookmarks from browser API
async function loadBookmarks() {
  const loadingEl = document.getElementById('loading');
  const bookmarksListEl = document.getElementById('bookmarks-list');
  const emptyStateEl = document.getElementById('empty-state');
  
  try {
    loadingEl.style.display = 'block';
    bookmarksListEl.style.display = 'none';
    emptyStateEl.style.display = 'none';
    
    // Get recent bookmarks
    const bookmarkItems = await browserAPI.bookmarks.getRecent(currentSettings.bookmarkLimit);
    
    // Calculate date cutoff
    const dateRangeDays = currentSettings.dateRange;
    const dateRangeMs = dateRangeDays * 24 * 60 * 60 * 1000;
    const startDate = Date.now() - dateRangeMs;
    
    // Filter bookmarks by date and remove folders
    allBookmarks = bookmarkItems.filter((item) =>
      item.url && item.dateAdded >= startDate,
    );

    // enhance bookmarks with folder paths
    allBookmarks = await Promise.all(
      allBookmarks.map(async (bookmark) => ({
        ...bookmark,
        folderPath: await getFolderDisplayPath(bookmark.parentId),
      })),
    );
    
    // Initial filter (no search query)
    filteredBookmarks = [...allBookmarks];
    
    // Display bookmarks
    displayBookmarks();
    
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    loadingEl.textContent = 'Error loading bookmarks';
  } finally {
    loadingEl.style.display = 'none';
  }
}

// Display bookmarks in the list
function displayBookmarks(searchQuery = '') {
  const bookmarksListEl = document.getElementById('bookmarks-list');
  const emptyStateEl = document.getElementById('empty-state');
  
  // Clear existing bookmarks
  // replace innerHTML to CSP and XSS compliance

  bookmarksListEl.textContent = '';
  
  if (filteredBookmarks.length === 0) {
    bookmarksListEl.style.display = 'none';
    emptyStateEl.style.display = 'block';
    return;
  }
  
  bookmarksListEl.style.display = 'block';
  emptyStateEl.style.display = 'none';
  
  // Create list items for each bookmark
  filteredBookmarks.forEach(bookmark => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = bookmark.url;
    a.target = '_blank';
    
    // Create favicon
    const faviconEl = createFavicon(bookmark.url);
    
    // Create content container
    const contentEl = document.createElement('div');
    contentEl.className = 'bookmark-content';
    
    // Create title
    const titleEl = document.createElement('div');
    titleEl.className = 'bookmark-title';
    const highlightNode = highlightText(bookmark.title || 'Untitled', searchQuery);
    titleEl.textContent = ''; // Clear previous content
    titleEl.appendChild(highlightNode);

    // Create folder path
    let folderEl = null;
    if (bookmark.folderPath) {
      folderEl = document.createElement('div');
      folderEl.className = 'bookmark-folder';
      folderEl.textContent = bookmark.folderPath;

    }

    // Create meta info
    const metaEl = document.createElement('div');
    metaEl.className = 'bookmark-meta';
    const timeAgo = getTimeAgo(bookmark.dateAdded);
    let hostname = 'Unknown';
    try {
      hostname = new URL(bookmark.url).hostname;
    } catch (error) {
      console.warn('Invalid URL for bookmark:', bookmark.url);
    }
    metaEl.textContent = `${hostname} • ${timeAgo}`;
    
    contentEl.appendChild(titleEl);

    if (folderEl) {
      contentEl.appendChild(folderEl);
    }

    contentEl.appendChild(metaEl);
    
    a.appendChild(faviconEl);
    a.appendChild(contentEl);
    li.appendChild(a);
    bookmarksListEl.appendChild(li);
  });
}

// Create favicon placeholder
function createFavicon(url) {
  try {
    const domain = new URL(url).hostname;
    const placeholder = document.createElement('div');
    placeholder.className = 'favicon-placeholder';
    placeholder.textContent = domain && domain.length > 0
      ? domain[0].toUpperCase()
      : '?';

    return placeholder;
  } catch (error) {
    const placeholder = document.createElement('div');
    placeholder.className = 'favicon-placeholder';
    placeholder.textContent = '?';
    return placeholder;
  }
}

// Handle search input
function handleSearch(event) {
  const query = event.target.value.toLowerCase().trim();
  
  if (query === '') {
    filteredBookmarks = [...allBookmarks];
  } else {
    filteredBookmarks = allBookmarks.filter(bookmark => {
      const title = (bookmark.title || '').toLowerCase();
      const url = (bookmark.url || '').toLowerCase();
      return title.includes(query) || url.includes(query);
    });
  }
  
  displayBookmarks(query);
}

// Handle date range change
function handleDateRangeChange(event) {
  const newDateRange = parseInt(event.target.value);
  currentSettings.dateRange = newDateRange;
  saveSettings();
  loadBookmarks();
}

// Highlight search terms in text
function highlightText(text, query) {
  const container = document.createElement('span');
  
  if (!query) {
    container.textContent = text;
    return container;
  }
  
  // Escape the query for use in regex
  const escapedQuery = escapeRegex(query);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  
  // Split text by the search query
  const parts = text.split(regex);
  
  // Create text nodes and highlight spans
  parts.forEach((part, index) => {
    if (part) {
      if (index % 2 === 1) {
        // This is a matched part - create a highlight span
        const highlight = document.createElement('span');
        highlight.className = 'highlight';
        highlight.textContent = part;
        container.appendChild(highlight);
      } else {
        // This is a non-matched part - create a text node
        container.appendChild(document.createTextNode(part));
      }
    }
  });
  
  return container;
}

// Escape regex special characters
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get relative time string
function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) {
    return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
  } else if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (days < 7) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
}
