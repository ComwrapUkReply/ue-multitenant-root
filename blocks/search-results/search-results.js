import {
  createOptimizedPicture,
  decorateIcons,
} from '../../scripts/aem.js';

/**
 * Default configuration for search results block
 */
const CONFIG = {
  defaultSource: '/query-index.json',
  itemsPerPage: 3, // Number of results per page (set to 3 for testing)
  placeholders: {
    searchNoResultsFor: 'No results found for',
    searchResultsTitle: 'Search Results',
    searchPlaceholder: 'Search...',
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
    return null;
  }

  try {
    const response = await fetch(source);
    if (!response.ok) {
      return null;
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    const json = await response.json();
    if (!json || !json.data) {
      return null;
    }

    return json.data;
  } catch (error) {
    return null;
  }
}

/**
 * Renders a single search result item
 * @param {Object} result - Search result data
 * @param {string[]} searchTerms - Array of search terms for highlighting
 * @param {string} titleTag - HTML tag to use for result title
 * @param {boolean} showImages - Whether to include images in results
 * @returns {HTMLLIElement} List item element for the result
 */
function renderResult(result, searchTerms, titleTag, showImages) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = result.path;
  if (showImages && result.image) {
    const wrapper = document.createElement('div');
    wrapper.className = 'search-result-image';
    const alt = result.title || '';
    const pic = createOptimizedPicture(result.image, alt, false, [{ width: '375' }]);
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
 * Creates accessible pagination controls
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Callback when page changes
 * @returns {HTMLElement} Pagination nav element
 */
function createPagination(currentPage, totalPages, onPageChange) {
  const nav = document.createElement('nav');
  nav.className = 'search-results-pagination';
  nav.setAttribute('aria-label', 'Search results pagination');
  nav.setAttribute('role', 'navigation');

  const list = document.createElement('ul');
  list.className = 'pagination-list';

  // Previous button
  const prevLi = document.createElement('li');
  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-arrow pagination-prev';
  prevButton.innerHTML = '<span class="pagination-arrow-icon" aria-hidden="true">&lt;</span>';
  prevButton.setAttribute('aria-label', 'Go to previous page');
  prevButton.disabled = currentPage === 1;
  if (currentPage === 1) {
    prevButton.setAttribute('aria-disabled', 'true');
  }
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  });
  prevLi.append(prevButton);
  list.append(prevLi);

  // Calculate which page numbers to show
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust start if we're near the end
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // First page + ellipsis if needed
  if (startPage > 1) {
    const firstLi = document.createElement('li');
    const firstButton = document.createElement('button');
    firstButton.className = 'pagination-number';
    firstButton.textContent = '1';
    firstButton.setAttribute('aria-label', 'Go to page 1');
    firstButton.addEventListener('click', () => onPageChange(1));
    firstLi.append(firstButton);
    list.append(firstLi);

    if (startPage > 2) {
      const ellipsisLi = document.createElement('li');
      ellipsisLi.className = 'pagination-ellipsis';
      ellipsisLi.setAttribute('aria-hidden', 'true');
      ellipsisLi.innerHTML = '<span>…</span>';
      list.append(ellipsisLi);
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i += 1) {
    const pageLi = document.createElement('li');
    const pageButton = document.createElement('button');
    pageButton.className = 'pagination-number';
    pageButton.textContent = i.toString();

    if (i === currentPage) {
      pageButton.classList.add('active');
      pageButton.setAttribute('aria-current', 'page');
      pageButton.setAttribute('aria-label', `Page ${i}, current page`);
    } else {
      pageButton.setAttribute('aria-label', `Go to page ${i}`);
      pageButton.addEventListener('click', () => onPageChange(i));
    }

    pageLi.append(pageButton);
    list.append(pageLi);
  }

  // Last page + ellipsis if needed
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsisLi = document.createElement('li');
      ellipsisLi.className = 'pagination-ellipsis';
      ellipsisLi.setAttribute('aria-hidden', 'true');
      ellipsisLi.innerHTML = '<span>…</span>';
      list.append(ellipsisLi);
    }

    const lastLi = document.createElement('li');
    const lastButton = document.createElement('button');
    lastButton.className = 'pagination-number';
    lastButton.textContent = totalPages.toString();
    lastButton.setAttribute('aria-label', `Go to page ${totalPages}`);
    lastButton.addEventListener('click', () => onPageChange(totalPages));
    lastLi.append(lastButton);
    list.append(lastLi);
  }

  // Next button
  const nextLi = document.createElement('li');
  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-arrow pagination-next';
  nextButton.innerHTML = '<span class="pagination-arrow-icon" aria-hidden="true">&gt;</span>';
  nextButton.setAttribute('aria-label', 'Go to next page');
  nextButton.disabled = currentPage === totalPages;
  if (currentPage === totalPages) {
    nextButton.setAttribute('aria-disabled', 'true');
  }
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  });
  nextLi.append(nextButton);
  list.append(nextLi);

  nav.append(list);

  // Add live region for screen reader announcements
  const liveRegion = document.createElement('div');
  liveRegion.className = 'sr-only';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  nav.append(liveRegion);

  return nav;
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

  return data.filter((item) => folders.some((folder) => {
    const normalizedFolder = folder.trim().toLowerCase();
    const normalizedPath = item.path.toLowerCase();
    return normalizedPath.startsWith(normalizedFolder);
  }));
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
 * Renders all search results with pagination
 * @param {HTMLElement} block - The search results block element
 * @param {Object} config - Search configuration object
 * @param {Array} filteredData - Filtered search results
 * @param {string[]} searchTerms - Array of search terms for highlighting
 * @param {string} headingTag - HTML tag to use for result titles
 * @param {boolean} showImages - Whether to include images in results
 * @param {number} currentPage - Current page number (1-indexed)
 */
function renderResults(block, config, filteredData, searchTerms, headingTag, showImages, currentPage = 1) {
  const resultsContainer = block.querySelector('.search-results-list');
  resultsContainer.innerHTML = '';

  // Remove existing pagination
  const existingPagination = block.querySelector('.search-results-pagination');
  if (existingPagination) {
    existingPagination.remove();
  }

  if (filteredData.length) {
    resultsContainer.classList.remove('no-results');

    // Calculate pagination
    const totalResults = filteredData.length;
    const itemsPerPage = CONFIG.itemsPerPage;
    const totalPages = Math.ceil(totalResults / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalResults);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Render paginated results
    paginatedData.forEach((result) => {
      const li = renderResult(result, searchTerms, headingTag, showImages);
      resultsContainer.append(li);
    });

    // Update results count with pagination info
    const resultsCount = block.querySelector('.search-results-count');
    if (resultsCount) {
      const query = searchTerms.join(' ');
      let message = `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`;

      // Add folder filter info if active
      if (config.folders && config.folders.length > 0) {
        const folderList = config.folders.join(', ');
        message += ` in ${folderList}`;
      }

      // Add pagination info
      if (totalPages > 1) {
        message += ` (showing ${startIndex + 1}-${endIndex} of ${totalResults})`;
      }

      resultsCount.textContent = message;
    }

    // Add pagination if more than one page
    if (totalPages > 1) {
      const pagination = createPagination(currentPage, totalPages, (newPage) => {
        renderResults(block, config, filteredData, searchTerms, headingTag, showImages, newPage);

        // Scroll to top of results
        block.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Announce page change to screen readers
        const liveRegion = block.querySelector('.search-results-pagination .sr-only');
        if (liveRegion) {
          liveRegion.textContent = `Page ${newPage} of ${totalPages}`;
        }
      });
      block.append(pagination);
    }
  } else {
    const noResultsMessage = document.createElement('li');
    resultsContainer.classList.add('no-results');
    noResultsMessage.textContent = config.placeholders.searchNoResultsFor || 'No results found.';
    resultsContainer.append(noResultsMessage);

    // Update results count
    const resultsCount = block.querySelector('.search-results-count');
    if (resultsCount) {
      const query = searchTerms.join(' ');
      let message = `${config.placeholders.searchNoResultsFor} "${query}"`;

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
    dataToSearch = filterByFolder(data, config.folders);
  }

  // Then apply search term filtering
  const filteredData = filterData(searchTerms, dataToSearch);
  const headingTag = findNextHeading(block);
  const showImages = block.classList.contains('cards') || block.classList.contains('minimal');
  renderResults(block, config, filteredData, searchTerms, headingTag, showImages);
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

  // Use configured placeholder text with fallback
  const searchPlaceholder = config.placeholders.searchPlaceholder || CONFIG.placeholders.searchPlaceholder;
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
 * Extracts pathname from a URL or returns the value as-is
 * @param {string} href - The URL or path
 * @returns {string} The pathname or original value
 */
function extractPathname(href) {
  try {
    const url = new URL(href);
    return url.pathname;
  } catch (e) {
    return href;
  }
}

/**
 * Transforms AEM content path to published path
 * @param {string} path - The AEM content path
 * @returns {string} The transformed path
 */
function transformAEMPath(path) {
  let folder = path.trim();
  // Remove /content/ue-multitenant-root prefix if present
  if (folder.startsWith('/content/ue-multitenant-root')) {
    folder = folder.replace('/content/ue-multitenant-root', '');
  }
  // Ensure folder starts with /
  if (folder && !folder.startsWith('/')) {
    folder = `/${folder}`;
  }
  return folder;
}

/**
 * Extracts classes value from block content using fallback method
 * Looks for a div containing "classes" or "display style" text
 * @param {HTMLElement} block - The block element
 * @returns {string} Classes value or empty string
 */
function extractClassesFallback(block) {
  const allDivs = [...block.querySelectorAll('div')];
  const classesDiv = allDivs.find((div) => {
    const text = div.textContent.trim().toLowerCase();
    const hasClassesText = text === 'classes' || text === 'display style';
    const hasNextSibling = div.nextElementSibling;
    const nextSiblingIsDiv = div.nextElementSibling && div.nextElementSibling.tagName === 'DIV';
    return hasClassesText && hasNextSibling && nextSiblingIsDiv;
  });

  if (classesDiv && classesDiv.nextElementSibling) {
    const classesValue = classesDiv.nextElementSibling.textContent.trim();
    if (classesValue && classesValue !== 'classes' && classesValue !== 'display style') {
      return classesValue;
    }
  }
  return '';
}

/**
 * Extracts search results title from block content using fallback method
 * Looks for a div containing "searchresultstitle" or "title" text
 * @param {HTMLElement} block - The block element
 * @returns {string} Title value or empty string
 */
function extractTitleFallback(block) {
  const allDivs = [...block.querySelectorAll('div')];
  const titleDiv = allDivs.find((div) => {
    const text = div.textContent.trim().toLowerCase();
    const hasTitleText = text === 'searchresultstitle'
      || text === 'search results title'
      || text === 'title';
    const hasNextSibling = div.nextElementSibling;
    const nextSiblingIsDiv = div.nextElementSibling && div.nextElementSibling.tagName === 'DIV';
    return hasTitleText && hasNextSibling && nextSiblingIsDiv;
  });

  if (titleDiv && titleDiv.nextElementSibling) {
    const titleValue = titleDiv.nextElementSibling.textContent.trim();
    if (titleValue
      && titleValue.toLowerCase() !== 'searchresultstitle'
      && titleValue.toLowerCase() !== 'search results title'
      && titleValue.toLowerCase() !== 'title') {
      return titleValue;
    }
  }
  return '';
}

/**
 * Parses block configuration from block content
 * @param {HTMLElement} block - The block element
 * @returns {Object} Configuration object with folders, placeholders, and classes
 */
function parseBlockConfig(block) {
  let folders = [];
  let classes = '';
  const placeholders = { ...CONFIG.placeholders };

  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];

    if (cells.length >= 2) {
      // Two-column structure: label | value
      const label = cells[0].textContent.trim().toLowerCase();
      const valueCell = cells[1];
      const link = valueCell.querySelector('a[href]');
      const textContent = valueCell.textContent.trim();

      if (label.includes('folder')) {
        let folderInput = '';
        if (link && link.href) {
          folderInput = extractPathname(link.href);
        } else if (textContent) {
          folderInput = textContent;
        }

        if (folderInput) {
          folders = folderInput
            .split(',')
            .map((f) => transformAEMPath(f))
            .filter((f) => f.length > 0);
        }
      } else if ((label.includes('display style') || label.includes('classes')) && textContent) {
        // Extract classes value
        classes = textContent.trim();
      } else if (label.includes('no results') && label.includes('for') && textContent) {
        placeholders.searchNoResultsFor = textContent;
      } else if ((label.includes('search results title') || label.includes('searchresultstitle') || label === 'title') && textContent) {
        placeholders.searchResultsTitle = textContent;
      } else if (label.includes('search placeholder') && textContent) {
        placeholders.searchPlaceholder = textContent;
      }
    }
  });

  // Single-column structure: collect all values and assign by content type
  // AEM may compress rows, so we can't rely on row index matching field index
  const collectedValues = {
    paths: [],
    knownClasses: [],
    textValues: [],
  };

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 1) {
      const cell = cells[0];
      const link = cell.querySelector('a[href]');
      const textContent = cell.textContent.trim();

      let value = null;
      if (link && link.href) {
        value = extractPathname(link.href);
      } else if (textContent && textContent.length > 0) {
        value = textContent;
      }

      if (value) {
        const isPath = value.startsWith('/') || link;
        const isKnownClass = ['cards', 'minimal'].includes(value.toLowerCase());

        if (isPath) {
          collectedValues.paths.push(value);
        } else if (isKnownClass) {
          collectedValues.knownClasses.push(value);
        } else {
          collectedValues.textValues.push(value);
        }
      }
    }
  });

  // Assign collected values to appropriate fields
  // Paths → folder
  if (collectedValues.paths.length > 0 && folders.length === 0) {
    folders = collectedValues.paths[0]
      .split(',')
      .map((f) => transformAEMPath(f))
      .filter((f) => f.length > 0);
  }

  // Known classes → classes
  if (collectedValues.knownClasses.length > 0 && !classes) {
    classes = collectedValues.knownClasses[0];
  }

  // Text values assignment based on field order:
  // searchPlaceholder, searchNoResultsFor, searchResultsTitle
  if (collectedValues.textValues.length === 1) {
    // Only one text value - it's the title (last field)
    placeholders.searchResultsTitle = collectedValues.textValues[0];
  } else if (collectedValues.textValues.length === 2) {
    // Two text values - first is no results message, second is title
    placeholders.searchNoResultsFor = collectedValues.textValues[0];
    placeholders.searchResultsTitle = collectedValues.textValues[1];
  } else if (collectedValues.textValues.length >= 3) {
    // Three text values - placeholder, no results message, title
    placeholders.searchPlaceholder = collectedValues.textValues[0];
    placeholders.searchNoResultsFor = collectedValues.textValues[1];
    placeholders.searchResultsTitle = collectedValues.textValues[2];
  }

  // Fallback: try to extract classes using direct DOM search if not found
  if (!classes) {
    classes = extractClassesFallback(block);
  }

  // Fallback: try to extract title using direct DOM search if not found
  if (!placeholders.searchResultsTitle || placeholders.searchResultsTitle === CONFIG.placeholders.searchResultsTitle) {
    const titleFallback = extractTitleFallback(block);
    if (titleFallback) {
      placeholders.searchResultsTitle = titleFallback;
    }
  }

  return { folders, placeholders, classes };
}

/**
 * Decorates the search results block
 * @param {HTMLElement} block - The search results block element
 */
export default async function decorate(block) {
  // Parse configuration from block content
  const { folders, placeholders, classes } = parseBlockConfig(block);

  // Apply classes to block before clearing content
  if (classes && classes.trim()) {
    const classNames = classes.trim().split(/\s+/).filter((c) => c);
    if (classNames.length > 0) {
      block.classList.add(...classNames);
    }
  }

  // Build configuration object (always use default query-index.json)
  const config = {
    source: CONFIG.defaultSource,
    folders,
    placeholders,
  };

  // Clear block content and build search results UI
  block.innerHTML = '';

  // Create title
  const title = document.createElement('h3');
  title.className = 'search-results-title';
  title.textContent = placeholders.searchResultsTitle || CONFIG.placeholders.searchResultsTitle;

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

  block.append(title, searchBox, resultsCount, resultsList);

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
