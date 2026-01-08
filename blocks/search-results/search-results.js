import {
  createOptimizedPicture,
  decorateIcons,
} from '../../scripts/aem.js';

// Module-level log to confirm file is loaded
// eslint-disable-next-line no-console
console.log('🔍 search-results.js module loaded');

/**
 * Default configuration for search results block
 */
const CONFIG = {
  defaultSource: '/query-index.json',
  placeholders: {
    searchPlaceholder: 'Search...',
    searchNoResults: 'No results found.',
    searchResultsTitle: 'Search Results',
  },
};

/** URL search params for managing query state */
const searchParams = new URLSearchParams(window.location.search);

/**
 * Checks if we're in AEM authoring mode
 * @returns {boolean} True if in authoring mode
 */
function isAuthoringMode() {
  const { hostname, pathname } = window.location;
  // Check for AEM Cloud authoring environment
  if (hostname.includes('adobeaemcloud.com') && (hostname.includes('author-') || pathname.includes('/editor.html'))) {
    return true;
  }
  // Check for Universal Editor
  if (pathname.includes('/editor.html') || searchParams.has('editor')) {
    return true;
  }
  return false;
}

/**
 * Finds the appropriate heading level for search results based on context
 * @param {HTMLElement} el - Element to find heading context from
 * @returns {string} Heading tag name (e.g., 'H2', 'H3')
 */
function findNextHeading(el) {
  let precedingEl = el.parentElement.previousElement || el.parentElement.parentElement;
  let h = 'H2';
  while (precedingEl) {
    const lastHeading = [...precedingEl.querySelectorAll('h1, h2, h3, h4, h5, h6')].pop();
    if (lastHeading) {
      const level = parseInt(lastHeading.nodeName[1], 10);
      h = level < 6 ? `H${level + 1}` : 'H6';
      precedingEl = false;
    } else {
      precedingEl = precedingEl.previousElement || precedingEl.parentElement;
    }
  }
  return h;
}

/**
 * Highlights search terms within text elements
 * @param {string[]} terms - Array of search terms to highlight
 * @param {HTMLElement[]} elements - Array of elements containing text to highlight
 */
function highlightTextElements(terms, elements) {
  elements.forEach((element) => {
    if (!element || !element.textContent) return;

    const matches = [];
    const { textContent } = element;
    terms.forEach((term) => {
      let start = 0;
      let offset = textContent.toLowerCase().indexOf(term.toLowerCase(), start);
      while (offset >= 0) {
        matches.push({ offset, term: textContent.substring(offset, offset + term.length) });
        start = offset + term.length;
        offset = textContent.toLowerCase().indexOf(term.toLowerCase(), start);
      }
    });

    if (!matches.length) {
      return;
    }

    matches.sort((a, b) => a.offset - b.offset);
    let currentIndex = 0;
    const fragment = matches.reduce((acc, { offset, term }) => {
      if (offset < currentIndex) return acc;
      const textBefore = textContent.substring(currentIndex, offset);
      if (textBefore) {
        acc.appendChild(document.createTextNode(textBefore));
      }
      const markedTerm = document.createElement('mark');
      markedTerm.textContent = term;
      acc.appendChild(markedTerm);
      currentIndex = offset + term.length;
      return acc;
    }, document.createDocumentFragment());
    const textAfter = textContent.substring(currentIndex);
    if (textAfter) {
      fragment.appendChild(document.createTextNode(textAfter));
    }
    element.innerHTML = '';
    element.appendChild(fragment);
  });
}

/**
 * Fetches search data from the specified source
 * @param {string} source - URL of the JSON data source
 * @returns {Promise<Array|null>} Array of data items or null on error
 */
async function fetchData(source) {
  // Skip search data fetch in authoring mode (query-index.json doesn't exist there)
  if (isAuthoringMode()) {
    // eslint-disable-next-line no-console
    console.info('Search is disabled in AEM authoring mode');
    return null;
  }

  try {
    const response = await fetch(source);
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('Error loading search data:', response.status, response.statusText);
      // eslint-disable-next-line no-console
      console.error('Source URL:', source);
      return null;
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // eslint-disable-next-line no-console
      console.error('Expected JSON but got:', contentType);
      // eslint-disable-next-line no-console
      console.error('Source URL:', source);
      return null;
    }

    const json = await response.json();
    if (!json) {
      // eslint-disable-next-line no-console
      console.error('Empty API response from:', source);
      return null;
    }

    if (!json.data) {
      // eslint-disable-next-line no-console
      console.error('API response missing "data" property:', source);
      return null;
    }

    return json.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch search data from:', source, error);
    return null;
  }
}

/**
 * Renders a single search result item
 * @param {Object} result - Search result data
 * @param {string[]} searchTerms - Array of search terms for highlighting
 * @param {string} titleTag - HTML tag to use for result title
 * @returns {HTMLLIElement} List item element for the result
 */
function renderResult(result, searchTerms, titleTag) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = result.path;
  if (result.image) {
    const wrapper = document.createElement('div');
    wrapper.className = 'search-result-image';
    const pic = createOptimizedPicture(result.image, '', false, [{ width: '375' }]);
    wrapper.append(pic);
    a.append(wrapper);
  }
  if (result.title) {
    const title = document.createElement(titleTag);
    title.className = 'search-result-title';
    title.textContent = result.title;
    highlightTextElements(searchTerms, [title]);
    a.append(title);
  }
  if (result.description) {
    const description = document.createElement('p');
    description.textContent = result.description;
    highlightTextElements(searchTerms, [description]);
    a.append(description);
  }
  li.append(a);
  return li;
}

/**
 * Compares two search hits by their minimum index
 * @param {Object} hit1 - First search hit
 * @param {Object} hit2 - Second search hit
 * @returns {number} Comparison result for sorting
 */
function compareFound(hit1, hit2) {
  return hit1.minIdx - hit2.minIdx;
}

/**
 * Filters data by folder path(s)
 * @param {Array} data - Array of data items to filter
 * @param {string[]} folders - Array of folder paths to filter by
 * @returns {Array} Filtered array of results matching folder paths
 */
function filterByFolder(data, folders) {
  if (!folders || folders.length === 0) {
    return data;
  }

  let debugCount = 0;
  const filtered = data.filter((item) => {
    // Check if item path starts with any of the specified folders
    const matches = folders.some((folder) => {
      const normalizedFolder = folder.trim().toLowerCase();
      const normalizedPath = item.path.toLowerCase();
      const isMatch = normalizedPath.startsWith(normalizedFolder);

      // Log first few items for debugging
      if (debugCount < 3) {
        // eslint-disable-next-line no-console
        console.log(`Checking: "${normalizedPath}" starts with "${normalizedFolder}"? ${isMatch}`);
        debugCount += 1;
      }

      return isMatch;
    });
    return matches;
  });

  return filtered;
}

/**
 * Filters data based on search terms
 * @param {string[]} searchTerms - Array of search terms
 * @param {Array} data - Array of data items to filter
 * @returns {Array} Filtered and sorted array of results
 */
function filterData(searchTerms, data) {
  const foundInHeader = [];
  const foundInMeta = [];

  data.forEach((result) => {
    let minIdx = -1;

    searchTerms.forEach((term) => {
      const idx = (result.header || result.title).toLowerCase().indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInHeader.push({ minIdx, result });
      return;
    }

    const metaContents = `${result.title} ${result.description} ${result.path.split('/').pop()}`.toLowerCase();
    searchTerms.forEach((term) => {
      const idx = metaContents.indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInMeta.push({ minIdx, result });
    }
  });

  return [
    ...foundInHeader.sort(compareFound),
    ...foundInMeta.sort(compareFound),
  ].map((item) => item.result);
}

/**
 * Renders all search results
 * @param {HTMLElement} block - The search results block element
 * @param {Object} config - Search configuration object
 * @param {Array} filteredData - Filtered search results
 * @param {string[]} searchTerms - Array of search terms for highlighting
 * @param {string} headingTag - HTML tag to use for result titles
 */
function renderResults(block, config, filteredData, searchTerms, headingTag) {
  const resultsContainer = block.querySelector('.search-results-list');
  resultsContainer.innerHTML = '';

  if (filteredData.length) {
    resultsContainer.classList.remove('no-results');
    filteredData.forEach((result) => {
      const li = renderResult(result, searchTerms, headingTag);
      resultsContainer.append(li);
    });

    // Update results count
    const resultsCount = block.querySelector('.search-results-count');
    if (resultsCount) {
      const count = filteredData.length;
      const query = searchTerms.join(' ');
      let message = `Found ${count} result${count !== 1 ? 's' : ''} for "${query}"`;

      // Add folder filter info if active
      if (config.folders && config.folders.length > 0) {
        const folderList = config.folders.join(', ');
        message += ` in ${folderList}`;
      }

      resultsCount.textContent = message;
    }
  } else {
    const noResultsMessage = document.createElement('li');
    resultsContainer.classList.add('no-results');
    noResultsMessage.textContent = config.placeholders.searchNoResults || 'No results found.';
    resultsContainer.append(noResultsMessage);

    // Update results count
    const resultsCount = block.querySelector('.search-results-count');
    if (resultsCount) {
      const query = searchTerms.join(' ');
      let message = `No results found for "${query}"`;

      // Add folder filter info if active
      if (config.folders && config.folders.length > 0) {
        const folderList = config.folders.join(', ');
        message += ` in ${folderList}`;
      }

      resultsCount.textContent = message;
    }
  }
}

/**
 * Handles search execution
 * @param {HTMLElement} block - The search results block element
 * @param {Object} config - Search configuration object
 * @param {string} searchValue - The search query
 */
async function executeSearch(block, config, searchValue) {
  const searchTerms = searchValue.toLowerCase().split(/\s+/).filter((term) => !!term);

  // Show loading state
  const resultsContainer = block.querySelector('.search-results-list');
  resultsContainer.innerHTML = '<li class="loading">Loading results...</li>';

  const data = await fetchData(config.source);
  if (!data) {
    // Show error message if data couldn't be loaded
    resultsContainer.innerHTML = '';
    resultsContainer.classList.add('no-results');
    const errorMessage = document.createElement('li');
    errorMessage.textContent = 'Unable to load search data. Please try again later.';
    resultsContainer.append(errorMessage);
    return;
  }

  // Apply folder filtering first (if configured)
  let dataToSearch = data;
  if (config.folders && config.folders.length > 0) {
    // eslint-disable-next-line no-console
    console.log('Applying folder filter:', config.folders);
    // eslint-disable-next-line no-console
    console.log('Total pages before filter:', data.length);
    dataToSearch = filterByFolder(data, config.folders);
    // eslint-disable-next-line no-console
    console.log('Pages after folder filter:', dataToSearch.length);
  }

  // Then apply search term filtering
  const filteredData = filterData(searchTerms, dataToSearch);
  const headingTag = findNextHeading(block);
  renderResults(block, config, filteredData, searchTerms, headingTag);
}

/**
 * Creates the search input element for results page
 * @param {HTMLElement} block - The search results block element
 * @param {Object} config - Search configuration object
 * @returns {HTMLInputElement} Search input element
 */
function createSearchInput(block, config) {
  const input = document.createElement('input');
  input.setAttribute('type', 'search');
  input.className = 'search-results-input';

  const searchPlaceholder = config.placeholders.searchPlaceholder || 'Search...';
  input.placeholder = searchPlaceholder;
  input.setAttribute('aria-label', searchPlaceholder);

  let searchTimeout;
  input.addEventListener('input', (e) => {
    const searchValue = e.target.value.trim();

    // Update URL with search query
    searchParams.set('q', searchValue);
    if (window.history.replaceState) {
      const url = new URL(window.location.href);
      url.search = searchParams.toString();
      window.history.replaceState({}, '', url.toString());
    }

    // Debounce search
    clearTimeout(searchTimeout);
    if (searchValue.length >= 3) {
      searchTimeout = setTimeout(() => {
        executeSearch(block, config, searchValue);
      }, 300);
    } else if (searchValue.length === 0) {
      // Clear results if search is empty
      const resultsContainer = block.querySelector('.search-results-list');
      resultsContainer.innerHTML = '';
      const resultsCount = block.querySelector('.search-results-count');
      if (resultsCount) {
        resultsCount.textContent = '';
      }
    }
  });

  return input;
}

/**
 * Creates the search icon element
 * @returns {HTMLSpanElement} Search icon span element
 */
function createSearchIcon() {
  const icon = document.createElement('span');
  icon.classList.add('icon', 'icon-search');
  return icon;
}

/**
 * Decorates the search results block
 * @param {HTMLElement} block - The search results block element
 */
export default async function decorate(block) {
  // eslint-disable-next-line no-console
  console.log('🔍 SEARCH-RESULTS BLOCK: decorate() function called!');
  // eslint-disable-next-line no-console
  console.log('Block element:', block);

  // Extract data source and folder filter from block content
  let source = CONFIG.defaultSource;
  let folders = [];

  const rows = [...block.children];
  // eslint-disable-next-line no-console
  console.log('Block rows count:', rows.length);

  rows.forEach((row, rowIndex) => {
    const cells = [...row.children];
    // eslint-disable-next-line no-console
    console.log(`Row ${rowIndex}: ${cells.length} cells`);

    if (cells.length >= 2) {
      // Two-column structure: label | value
      const label = cells[0].textContent.trim().toLowerCase();
      const valueCell = cells[1];
      const link = valueCell.querySelector('a[href]');
      const textContent = valueCell.textContent.trim();

      // eslint-disable-next-line no-console
      console.log(`  Label: "${label}"`);
      // eslint-disable-next-line no-console
      console.log(`  Has link: ${!!link}, Text: "${textContent}"`);

      if (label.includes('source') && link) {
        source = link.href;
      } else if (label.includes('folder')) {
        // Get folder path from link href or text content
        let folderInput = '';
        if (link && link.href) {
          // Extract pathname from full URL
          try {
            const url = new URL(link.href);
            folderInput = url.pathname;
          } catch (e) {
            // If URL parsing fails, use href as-is
            folderInput = link.href;
          }
        } else if (textContent) {
          folderInput = textContent;
        }

        // eslint-disable-next-line no-console
        console.log('Raw folder input:', folderInput);

        if (folderInput) {
          // Parse folder paths (can be comma-separated)
          folders = folderInput
            .split(',')
            .map((f) => {
              let folder = f.trim();
              // Transform AEM content path to published path
              // Remove /content/ue-multitenant-root prefix if present
              if (folder.startsWith('/content/ue-multitenant-root')) {
                folder = folder.replace('/content/ue-multitenant-root', '');
              }
              // Ensure folder starts with /
              if (folder && !folder.startsWith('/')) {
                folder = `/${folder}`;
              }
              return folder;
            })
            .filter((f) => f.length > 0);

          // eslint-disable-next-line no-console
          console.log('Folder filter configured:', folders);
        }
      }
    } else if (cells.length === 1) {
      // Single-column structure: just the link or text
      const cell = cells[0];
      const link = cell.querySelector('a[href]');
      const textContent = cell.textContent.trim();

      // eslint-disable-next-line no-console
      console.log(`  Has link: ${!!link}, Text: "${textContent}"`);

      // Get value from link or text content
      let value = null;
      if (link && link.href) {
        // Extract pathname from full URL for aem-content fields
        try {
          const url = new URL(link.href);
          value = url.pathname;
        } catch (e) {
          // If URL parsing fails, use href as-is
          value = link.href;
        }
      } else if (textContent && textContent.length > 0) {
        value = textContent;
      }

      // eslint-disable-next-line no-console
      console.log(`  Extracted value: "${value}"`);

      if (value) {
        // First non-empty row is data source, second is folder filter
        if (rowIndex === 0) {
          source = value;
          // eslint-disable-next-line no-console
          console.log('Source configured:', source);
        } else if (rowIndex === 1) {
          // Parse folder paths (can be comma-separated)
          folders = value
            .split(',')
            .map((f) => {
              let folder = f.trim();
              // Transform AEM content path to published path
              // Remove /content/ue-multitenant-root prefix if present
              if (folder.startsWith('/content/ue-multitenant-root')) {
                folder = folder.replace('/content/ue-multitenant-root', '');
              }
              // Ensure folder starts with /
              if (folder && !folder.startsWith('/')) {
                folder = `/${folder}`;
              }
              return folder;
            })
            .filter((f) => f.length > 0);

          // eslint-disable-next-line no-console
          console.log('Folder filter configured:', folders);
        }
      }
    }
  });

  // Build configuration object
  const config = {
    source,
    folders,
    placeholders: CONFIG.placeholders,
  };

  // Clear block content and build search results UI
  block.innerHTML = '';

  // Create search box
  const searchBox = document.createElement('div');
  searchBox.className = 'search-results-box';
  searchBox.append(
    createSearchIcon(),
    createSearchInput(block, config),
  );

  // Create results count
  const resultsCount = document.createElement('div');
  resultsCount.className = 'search-results-count';

  // Create results list
  const resultsList = document.createElement('ul');
  resultsList.className = 'search-results-list';

  block.append(searchBox, resultsCount, resultsList);

  decorateIcons(block);

  // Execute search if query parameter exists
  const queryParam = searchParams.get('q');
  if (queryParam && queryParam.length >= 3) {
    const input = block.querySelector('.search-results-input');
    if (input) {
      input.value = queryParam;
      await executeSearch(block, config, queryParam);
    }
  }
}
