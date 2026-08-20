// Use chrome API with browser fallback for Firefox compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// State management
let allBookmarks = [];
let filteredBookmarks = [];
let selectedFolderIds = [];
let searchQuery = '';
let currentSettings = {
  theme: 'auto',
  dateRange: 14,
  bookmarkLimit: 200,
  selectedFolderIds: [],
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
    browserAPI.storage.local.get(['theme', 'dateRange', 'bookmarkLimit', 'selectedFolderIds'], (result) => {
      // Ensure result is an object
      result = result || {};
      currentSettings = {
        theme: result.theme || 'auto',
        dateRange: result.dateRange || 14,
        bookmarkLimit: result.bookmarkLimit || 200,
        selectedFolderIds: result.selectedFolderIds || [],
      };
      selectedFolderIds = currentSettings.selectedFolderIds;

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

  // Export JSON button
  const exportJsonButton = document.getElementById('export-json');
  exportJsonButton.addEventListener('click', exportBookmarksAsJson);

  // Export HTML button
  const exportHtmlButton = document.getElementById('export-html');
  exportHtmlButton.addEventListener('click', exportBookmarksAsHtml);
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

// Get folder ancestry
async function getFolderAncestry(parentId) {
  const folders = [];
  let currentId = parentId;

  try {
    while (currentId) {
      const [folder] = await browserAPI.bookmarks.get(currentId);

      if (!folder || !folder.title) {
        break;
      }

      folders.push({
        id: folder.id,
        title: folder.title,
      });

      currentId = folder.parentId;
    }
  } catch (error) {
    console.warn('Unable to determine bookmark folder ancestry:', error);
  }

  return folders;
}

// Get unique folders from bookmarks
function getAvailableFolders() {
  const foldersById = new Map();

  allBookmarks.forEach(bookmark => {
    const folder = bookmark.folderAncestry?.[0];
    const parentFolder = bookmark.folderAncestry?.[1];

    if (folder) {
      foldersById.set(folder.id, {
        id: folder.id,
        title: folder.title,
        parentTitle: parentFolder?.title || '',
      });
    }
  });

  const folders = Array.from(foldersById.values());
  return folders.map(folder => {
    const hasDuplicateName = folders.some(otherFolder =>
      otherFolder.id !== folder.id &&
      otherFolder.title === folder.title,
    );

    return {
      ...folder,
      label: hasDuplicateName && folder.parentTitle
        ? `${folder.parentTitle} / ${folder.title}`
        : folder.title,
    };
  });
}

// Create a hierarchical tree structure of bookmarks
function createBookmarkTree(bookmarks) {
  const root = {
    bookmarks: [],
    folders: {},
  };

  bookmarks.forEach(bookmark => {
    const folders = getExportFolders(bookmark.folderAncestry);
    let current = root;

    folders.forEach(folderName => {
      if (!current.folders[folderName]) {
        current.folders[folderName] = {
          bookmarks: [],
          folders: {},
        };
      }

      current = current.folders[folderName];
    });

    current.bookmarks.push(createExportBookmark(bookmark));
  });

  return root;
}

// Get export folder paths for bookmarks
function getExportFolders(folderAncestry = []) {
  return folderAncestry
    .filter(folder =>
      folder.title &&
      folder.title !== 'Bookmarks Toolbar' &&
      folder.title !== 'Bookmarks Menu' &&
      folder.title !== 'Other Bookmarks',
    )
    .map(folder => folder.title)
    .reverse();
}

// Create exportable data structure
function createExportData(bookmarks) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    bookmarks: bookmarks.map(createExportBookmark),
  };
}

// Create exportable bookmark object
function createExportBookmark(bookmark) {
  return {
    title: bookmark.title || '',
    url: bookmark.url,
    dateAdded: new Date(bookmark.dateAdded).toISOString(),
    folders: getExportFolders(bookmark.folderAncestry),
  };
}

// Export bookmarks as JSON file
function exportBookmarksAsJson() {
  const exportData = createExportData(filteredBookmarks);
  const json = JSON.stringify(exportData, null, 2);

  const blob = new Blob([json], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `recent-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;

  link.click();

  URL.revokeObjectURL(url);
}

// Serialize bookmark tree to Netscape format
function serializeBookmarkTree(node, indent = '    ') {
  const lines = [];

  node.bookmarks.forEach(bookmark => {
    lines.push(
      `${indent}<DT><A HREF="${escapeHtml(bookmark.url)}" ADD_DATE="${getNetscapeTimestamp(bookmark.dateAdded)}">${escapeHtml(bookmark.title)}</A>`,
    );
  });

  Object.entries(node.folders).forEach(([folderName, folderNode]) => {
    lines.push(`${indent}<DT><H3>${escapeHtml(folderName)}</H3>`);
    lines.push(`${indent}<DL><p>`);
    lines.push(serializeBookmarkTree(folderNode, `${indent}    `));
    lines.push(`${indent}</DL><p>`);
  });

  return lines.filter(Boolean).join('\n');
}

// Create Netscape bookmark HTML
function createNetscapeHtml(bookmarks) {
  const tree = createBookmarkTree(bookmarks);
  const content = serializeBookmarkTree(tree);

  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Recent Bookmarks</TITLE>
<H1>Recent Bookmarks</H1>
<DL><p>
${content}
</DL><p>
`;
}

// Export bookmarks as HTML file
function exportBookmarksAsHtml() {
  const html = createNetscapeHtml(filteredBookmarks);

  const blob = new Blob([html], {
    type: 'text/html;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `recent-bookmarks-${new Date().toISOString().slice(0, 10)}.html`;

  link.click();

  URL.revokeObjectURL(url);
}

// Render folder filter options
function renderFolderOptions() {
  const container = document.getElementById('folder-options');
  const folders = getAvailableFolders();

  container.textContent = '';

  folders.forEach(folder => {
    const label = document.createElement('label');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = folder.id;
    checkbox.checked = selectedFolderIds.includes(folder.id);
    checkbox.addEventListener('change', handleFolderChange);

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${folder.label}`));

    container.appendChild(label);
  });
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
        folderAncestry: await getFolderAncestry(bookmark.parentId),
      })),
    );

    // Render folder filter options
    renderFolderOptions();

    // Apply current search and folder filters
    applyFilters();
    
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

// Apply filters based on search query and selected folders
function applyFilters() {
  filteredBookmarks = allBookmarks.filter(bookmark => {
    const title = (bookmark.title || '').toLowerCase();
    const url = (bookmark.url || '').toLowerCase();

    const matchesSearch =
      !searchQuery ||
      title.includes(searchQuery) ||
      url.includes(searchQuery);

    const matchesFolder =
      selectedFolderIds.length === 0 ||
      selectedFolderIds.some(folderId =>
        bookmark.folderAncestry.some(folder => folder.id === folderId),
      );

    return matchesSearch && matchesFolder;
  });

  //temp for testing

  displayBookmarks(searchQuery);
}

// Handle folder filter change
function handleFolderChange(event) {
  const folderId = event.target.value;

  if (event.target.checked) {
    selectedFolderIds.push(folderId);
  } else {
    selectedFolderIds = selectedFolderIds.filter(id => id !== folderId);
  }
  currentSettings.selectedFolderIds = selectedFolderIds;
  saveSettings();

  applyFilters();
}

// Handle search input
function handleSearch(event) {
  searchQuery = event.target.value.toLowerCase().trim();
  applyFilters();
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
// Escape HTML special characters
function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

//
function getNetscapeTimestamp(dateAdded) {
  return Math.floor(new Date(dateAdded).getTime() / 1000);
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
