/**
 * Search Utilities Module
 * Shared functionality for search and search-results blocks
 * @module search-utils
 */

import { createOptimizedPicture } from './aem.js';

/**
 * In-memory cache for search data
 * @type {Map<string, {data: Array, timestamp: number}>}
 */
const dataCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Default configuration for search functionality
 */
export const DEFAULT_CONFIG = {
  defaultSource: '/query-index.json',
  minSearchLength: 3,
  debounceMs: 300,
};

/**
 * Checks if we're in AEM authoring mode
 * @returns {boolean} True if in authoring mode
 */
export function isAuthoringMode() {
  const { hostname, pathname, search } = window.location;
  const searchParams = new URLSearchParams(search);

  // AEM Cloud authoring environment
  if (hostname.includes('adobeaemcloud.com')
      && (hostname.includes('author-') || pathname.includes('/editor.html'))) {
    return true;
  }

  // Universal Editor
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
export function findNextHeading(el) {
  let precedingEl = el.parentElement?.previousElementSibling || el.parentElement?.parentElement;
  let h = 'H2';

  while (precedingEl) {
    const lastHeading = [...precedingEl.querySelectorAll('h1, h2, h3, h4, h5, h6')].pop();
    if (lastHeading) {
      const level = parseInt(lastHeading.nodeName[1], 10);
      h = level < 6 ? `H${level + 1}` : 'H6';
      break;
    }
    precedingEl = precedingEl.previousElementSibling || precedingEl.parentElement;
  }

  return h;
}

/**
 * Highlights search terms within text elements using <mark> tags
 * @param {string[]} terms - Array of search terms to highlight
 * @param {HTMLElement[]} elements - Array of elements containing text to highlight
 */
export function highlightTextElements(terms, elements) {
  elements.forEach((element) => {
    if (!element?.textContent) return;

    const matches = [];
    const { textContent } = element;

    terms.forEach((term) => {
      let start = 0;
      let offset = textContent.toLowerCase().indexOf(term.toLowerCase(), start);

      while (offset >= 0) {
        matches.push({
          offset,
          term: textContent.substring(offset, offset + term.length),
        });
        start = offset + term.length;
        offset = textContent.toLowerCase().indexOf(term.toLowerCase(), start);
      }
    });

    if (!matches.length) return;

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

    element.textContent = '';
    element.appendChild(fragment);
  });
}

/**
 * Fetches search data from the specified source with caching
 * @param {string} source - URL of the JSON data source
 * @param {Object} [options] - Fetch options
 * @param {boolean} [options.useCache=true] - Whether to use cache
 * @param {boolean} [options.verbose=false] - Whether to log verbose errors
 * @returns {Promise<Array|null>} Array of data items or null on error
 */
export async function fetchData(source, options = {}) {
  const { useCache = true, verbose = false } = options;

  // Skip in authoring mode
  if (isAuthoringMode()) {
    if (verbose) {
      // eslint-disable-next-line no-console
      console.info('Search is disabled in AEM authoring mode');
    }
    return null;
  }

  // Check cache
  if (useCache) {
    const cached = dataCache.get(source);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const response = await fetch(source);

    if (!response.ok) {
      if (verbose) {
        // eslint-disable-next-line no-console
        console.error('Error loading search data:', response.status, response.statusText);
        // eslint-disable-next-line no-console
        console.error('Source URL:', source);
      }
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (verbose) {
        // eslint-disable-next-line no-console
        console.error('Expected JSON but got:', contentType);
        // eslint-disable-next-line no-console
        console.error('Source URL:', source);
      }
      return null;
    }

    const json = await response.json();

    if (!json?.data) {
      if (verbose) {
        // eslint-disable-next-line no-console
        console.error('API response missing "data" property:', source);
      }
      return null;
    }

    // Update cache
    if (useCache) {
      dataCache.set(source, { data: json.data, timestamp: Date.now() });
    }

    return json.data;
  } catch (error) {
    if (verbose) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch search data from:', source, error);
    }
    return null;
  }
}

/**
 * Clears the search data cache
 * @param {string} [source] - Optional specific source to clear, or all if not provided
 */
export function clearCache(source) {
  if (source) {
    dataCache.delete(source);
  } else {
    dataCache.clear();
  }
}

/**
 * Compares two search hits by their minimum index (for sorting)
 * @param {Object} hit1 - First search hit with minIdx property
 * @param {Object} hit2 - Second search hit with minIdx property
 * @returns {number} Comparison result for sorting
 */
export function compareFound(hit1, hit2) {
  return hit1.minIdx - hit2.minIdx;
}

/**
 * Filters data based on search terms
 * Prioritizes matches in headers over metadata
 * @param {string[]} searchTerms - Array of search terms (lowercase)
 * @param {Array} data - Array of data items to filter
 * @returns {Array} Filtered and sorted array of results
 */
export function filterData(searchTerms, data) {
  const foundInHeader = [];
  const foundInMeta = [];

  data.forEach((result) => {
    let minIdx = -1;

    // Search in header/title first (priority)
    searchTerms.forEach((term) => {
      const idx = (result.header || result.title || '').toLowerCase().indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInHeader.push({ minIdx, result });
      return;
    }

    // Search in metadata (title, description, path)
    const metaContents = `${result.title || ''} ${result.description || ''} ${result.path?.split('/').pop() || ''}`.toLowerCase();
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
 * Renders a single search result item
 * @param {Object} result - Search result data with path, title, description, image
 * @param {string[]} searchTerms - Array of search terms for highlighting
 * @param {string} titleTag - HTML tag to use for result title (e.g., 'H3')
 * @param {Object} [options] - Rendering options
 * @param {boolean} [options.showImages=false] - Whether to include images
 * @param {number} [options.imageWidth=375] - Width for optimized images
 * @returns {HTMLLIElement} List item element for the result
 */
export function renderResult(result, searchTerms, titleTag, options = {}) {
  const { showImages = false, imageWidth = 375 } = options;

  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = result.path;

  // Image (optional)
  if (showImages && result.image) {
    const wrapper = document.createElement('div');
    wrapper.className = 'search-result-image';
    const alt = result.title || '';
    const pic = createOptimizedPicture(result.image, alt, false, [{ width: String(imageWidth) }]);
    wrapper.append(pic);
    a.append(wrapper);
  }

  // Title
  if (result.title) {
    const title = document.createElement(titleTag);
    title.className = 'search-result-title';
    title.textContent = result.title;
    highlightTextElements(searchTerms, [title]);
    a.append(title);
  }

  // Description
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
 * Parses search terms from a string
 * @param {string} searchValue - Raw search input value
 * @returns {string[]} Array of lowercase, non-empty search terms
 */
export function parseSearchTerms(searchValue) {
  return searchValue.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Updates URL with search query parameter
 * @param {string} query - Search query
 * @param {string} [paramName='q'] - Query parameter name
 */
export function updateUrlWithQuery(query, paramName = 'q') {
  if (!window.history.replaceState) return;

  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set(paramName, query);
  } else {
    url.searchParams.delete(paramName);
  }
  window.history.replaceState({}, '', url.toString());
}

/**
 * Gets search query from URL
 * @param {string} [paramName='q'] - Query parameter name
 * @returns {string|null} Search query or null
 */
export function getQueryFromUrl(paramName = 'q') {
  return new URLSearchParams(window.location.search).get(paramName);
}
