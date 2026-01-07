import {
  createOptimizedPicture,
  decorateIcons,
} from '../../scripts/aem.js';

/**
 * Default configuration for search block
 */
const CONFIG = {
  defaultSource: '/query-index.json',
  placeholders: {
    searchPlaceholder: 'Search...',
    searchNoResults: 'No results found.',
  },
  suggestionsLimit: 5, // Number of suggestions to show in inline mode
};

/** URL search params for managing query state */
const searchParams = new URLSearchParams(window.location.search);

/**
 * Finds the appropriate heading level for search results based on context
 * @param {HTMLElement} el - Element to find heading context from
 * @returns {string} Heading tag name (e.g., 'H2', 'H3')
 */
function findNextHeading(el) {
  let preceedingEl = el.parentElement.previousElement || el.parentElement.parentElement;
  let h = 'H2';
  while (preceedingEl) {
    const lastHeading = [...preceedingEl.querySelectorAll('h1, h2, h3, h4, h5, h6')].pop();
    if (lastHeading) {
      const level = parseInt(lastHeading.nodeName[1], 10);
      h = level < 6 ? `H${level + 1}` : 'H6';
      preceedingEl = false;
    } else {
      preceedingEl = preceedingEl.previousElement || preceedingEl.parentElement;
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
export async function fetchData(source) {
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
 * Clears the search results container
 * @param {HTMLElement} block - The search block element
 */
function clearSearchResults(block) {
  const searchResults = block.querySelector('.search-results');
  searchResults.innerHTML = '';
}

/**
 * Clears search results and resets URL state
 * @param {HTMLElement} block - The search block element
 */
function clearSearch(block) {
  clearSearchResults(block);
  if (window.history.replaceState) {
    const url = new URL(window.location.href);
    url.search = '';
    searchParams.delete('q');
    window.history.replaceState({}, '', url.toString());
  }
}

/**
 * Renders search results into the results container
 * @param {HTMLElement} block - The search block element
 * @param {Object} config - Search configuration object
 * @param {Array} filteredData - Filtered search results
 * @param {string[]} searchTerms - Array of search terms for highlighting
 */
async function renderResults(block, config, filteredData, searchTerms) {
  clearSearchResults(block);
  const searchResults = block.querySelector('.search-results');
  const headingTag = searchResults.dataset.h;

  // Show limited suggestions (max 5)
  const limit = config.suggestionsLimit || 5;
  const dataToRender = filteredData.slice(0, limit);

  if (dataToRender.length) {
    searchResults.classList.remove('no-results');
    dataToRender.forEach((result) => {
      const li = renderResult(result, searchTerms, headingTag);
      searchResults.append(li);
    });

    // Add "View all results" link if there are more results and result page is configured
    if (config.resultPage && filteredData.length > dataToRender.length) {
      const viewAllLi = document.createElement('li');
      viewAllLi.className = 'search-view-all';
      const viewAllLink = document.createElement('a');
      const input = block.querySelector('.search-input');
      const searchQuery = input ? input.value : '';
      viewAllLink.href = `${config.resultPage}?q=${encodeURIComponent(searchQuery)}`;
      viewAllLink.textContent = `View all ${filteredData.length} results`;
      viewAllLi.append(viewAllLink);
      searchResults.append(viewAllLi);
    }
  } else {
    const noResultsMessage = document.createElement('li');
    searchResults.classList.add('no-results');
    noResultsMessage.textContent = config.placeholders.searchNoResults || 'No results found.';
    searchResults.append(noResultsMessage);
  }
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
 * Handles search input events
 * @param {Event} e - Input event
 * @param {HTMLElement} block - The search block element
 * @param {Object} config - Search configuration object
 */
async function handleSearch(e, block, config) {
  const searchValue = e.target.value;
  searchParams.set('q', searchValue);
  if (window.history.replaceState) {
    const url = new URL(window.location.href);
    url.search = searchParams.toString();
    window.history.replaceState({}, '', url.toString());
  }

  if (searchValue.length < 3) {
    clearSearch(block);
    return;
  }
  const searchTerms = searchValue.toLowerCase().split(/\s+/).filter((term) => !!term);

  const data = await fetchData(config.source);
  if (!data) {
    // Show error message if data couldn't be loaded
    const searchResults = block.querySelector('.search-results');
    searchResults.innerHTML = '';
    searchResults.classList.add('no-results');
    const errorMessage = document.createElement('li');
    errorMessage.textContent = 'Unable to load search data. Please try again later.';
    searchResults.append(errorMessage);
    return;
  }
  const filteredData = filterData(searchTerms, data);
  await renderResults(block, config, filteredData, searchTerms);
}

/**
 * Creates the search results container element
 * @param {HTMLElement} block - The search block element
 * @returns {HTMLUListElement} Results container element
 */
function searchResultsContainer(block) {
  const results = document.createElement('ul');
  results.className = 'search-results';
  results.dataset.h = findNextHeading(block);

  // add ARIA live region for screen reader announcements
  results.setAttribute('role', 'status');
  results.setAttribute('aria-live', 'polite');
  results.setAttribute('aria-atomic', true);

  return results;
}

/**
 * Navigates to the result page with the search query
 * @param {string} resultPageUrl - URL of the result page
 * @param {string} searchQuery - The search query
 */
function navigateToResultPage(resultPageUrl, searchQuery) {
  if (!resultPageUrl || !searchQuery) return;
  const url = new URL(resultPageUrl, window.location.origin);
  url.searchParams.set('q', searchQuery);
  window.location.href = url.toString();
}

/**
 * Creates the search input element
 * @param {HTMLElement} block - The search block element
 * @param {Object} config - Search configuration object
 * @returns {HTMLInputElement} Search input element
 */
function searchInput(block, config) {
  const input = document.createElement('input');
  input.setAttribute('type', 'search');
  input.className = 'search-input';

  const searchPlaceholder = config.placeholders.searchPlaceholder || 'Search...';
  input.placeholder = searchPlaceholder;
  input.setAttribute('aria-label', searchPlaceholder);

  input.addEventListener('input', (e) => {
    handleSearch(e, block, config);
  });

  input.addEventListener('keyup', (e) => {
    if (e.code === 'Escape') {
      clearSearch(block);
    }
  });

  // Add Enter key handler to navigate to result page if configured
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && config.resultPage) {
      e.preventDefault();
      const searchQuery = input.value.trim();
      // eslint-disable-next-line no-console
      console.log('Enter key pressed, navigating to:', config.resultPage, 'with query:', searchQuery);
      if (searchQuery.length >= 1) {
        navigateToResultPage(config.resultPage, searchQuery);
      }
    }
  });

  return input;
}

/**
 * Creates the search icon element
 * @param {HTMLElement} block - The search block element
 * @param {Object} config - Search configuration object
 * @returns {HTMLSpanElement|HTMLButtonElement} Search icon element
 */
function searchIcon(block, config) {
  // Always make icon clickable if result page is configured
  if (config.resultPage) {
    const button = document.createElement('button');
    button.classList.add('search-icon-button');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', 'Search');

    const icon = document.createElement('span');
    icon.classList.add('icon', 'icon-search');
    button.append(icon);

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const input = block.querySelector('.search-input');
      if (input) {
        const searchQuery = input.value.trim();
        // Navigate even with empty search (will show empty results page)
        if (searchQuery.length >= 1) {
          // eslint-disable-next-line no-console
          console.log('Search icon clicked, navigating to:', config.resultPage, 'with query:', searchQuery);
          navigateToResultPage(config.resultPage, searchQuery);
        }
      }
    });

    return button;
  }

  // Default non-clickable icon
  const icon = document.createElement('span');
  icon.classList.add('icon', 'icon-search');
  return icon;
}

/**
 * Finds the search block element on the page
 * @returns {HTMLElement|null} The search block element or null if not found
 */
function findSearchBlock() {
  return document.querySelector('.search.block');
}

/**
 * Toggles the search block visibility
 * @param {HTMLElement} block - The search block element
 * @param {HTMLButtonElement|null} button - Optional button element to sync aria-expanded
 */
function toggleSearchBlock(block, button = null) {
  if (!block) return;

  const isExpanded = block.getAttribute('aria-expanded') === 'true';
  const newState = !isExpanded;

  block.setAttribute('aria-expanded', newState.toString());

  if (button) {
    button.setAttribute('aria-expanded', newState.toString());
  }

  // Sync all search buttons on the page
  const allSearchButtons = document.querySelectorAll('.search-button');
  allSearchButtons.forEach((btn) => {
    btn.setAttribute('aria-expanded', newState.toString());
  });

  // Focus input when opening
  if (newState) {
    const input = block.querySelector('.search-input');
    if (input) {
      setTimeout(() => {
        input.focus();
      }, 100);
    }
  }
}

/**
 * Toggles the search block visibility on mobile
 * @param {HTMLElement} block - The search block element
 * @param {HTMLButtonElement} button - The mobile search button
 */
function toggleMobileSearch(block, button) {
  toggleSearchBlock(block, button);
}

/**
 * Creates the mobile search toggle button
 * @param {HTMLElement} block - The search block element
 * @returns {HTMLButtonElement} Mobile search button element
 */
function createMobileSearchButton(block) {
  const button = document.createElement('button');
  button.className = 'search-button';
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', 'Toggle search');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'search-panel');

  // Add search icon to button
  const icon = document.createElement('span');
  icon.classList.add('icon', 'icon-search');
  button.append(icon);

  // Add click handler
  button.addEventListener('click', () => {
    toggleMobileSearch(block, button);
  });

  return button;
}

/**
 * Creates the search box container with icon and input
 * @param {HTMLElement} block - The search block element
 * @param {Object} config - Search configuration object
 * @returns {HTMLDivElement} Search box container element
 */
function searchBox(block, config) {
  const box = document.createElement('div');
  box.classList.add('search-box');
  box.append(
    searchIcon(block, config),
    searchInput(block, config),
  );

  return box;
}

/**
 * Decorates the search block
 * @param {HTMLElement} block - The search block element
 */
export default async function decorate(block) {
  // Extract data source and result page from block rows
  let source = CONFIG.defaultSource;
  let resultPage = null;

  // Block structure: each row is a div containing two divs (label and value)
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const label = cells[0].textContent.trim().toLowerCase();
      const valueCell = cells[1];
      const link = valueCell.querySelector('a[href]');

      if (label.includes('source') && link) {
        source = link.href;
      } else if ((label.includes('result') || label.includes('page')) && link) {
        resultPage = link.href;
      }
    }
  });

  // Debug logging
  // eslint-disable-next-line no-console
  console.log('Search block config:', { source, resultPage });

  // Build configuration object
  const config = {
    source,
    resultPage,
    placeholders: CONFIG.placeholders,
    suggestionsLimit: CONFIG.suggestionsLimit,
  };

  // Clear block content and build search UI
  block.innerHTML = '';
  block.append(
    searchBox(block, config),
    searchResultsContainer(block),
  );

  // Add aria attributes for mobile toggle
  block.setAttribute('id', 'search-panel');
  block.setAttribute('aria-expanded', 'false');

  // Create mobile search button and insert into wrapper
  const wrapper = block.closest('.search-wrapper');
  if (wrapper) {
    const mobileButton = createMobileSearchButton(block);
    wrapper.insertBefore(mobileButton, block);
    decorateIcons(mobileButton);
  }

  // Restore search query from URL if present
  const queryParam = searchParams.get('q');
  if (queryParam) {
    const input = block.querySelector('input');
    if (input) {
      input.value = queryParam;
      input.dispatchEvent(new Event('input'));
    }
  }

  // Attach toggle handlers to all search buttons on the page
  const allSearchButtons = document.querySelectorAll('.search-button');
  allSearchButtons.forEach((button) => {
    // Remove existing listeners to avoid duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    // Set aria attributes if not already set
    if (!newButton.hasAttribute('aria-label')) {
      newButton.setAttribute('aria-label', 'Toggle search');
    }
    if (!newButton.hasAttribute('aria-expanded')) {
      newButton.setAttribute('aria-expanded', 'false');
    }
    if (!newButton.hasAttribute('aria-controls')) {
      newButton.setAttribute('aria-controls', 'search-panel');
    }

    // Add click handler to toggle search block
    newButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const searchBlock = findSearchBlock();
      if (searchBlock) {
        toggleSearchBlock(searchBlock, newButton);
      }
    });

    // Decorate icons if this button has icons
    if (newButton.querySelector('.icon')) {
      decorateIcons(newButton);
    }
  });

  decorateIcons(block);
}
