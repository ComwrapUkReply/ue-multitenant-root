/* eslint-disable no-console */
/* eslint-disable max-len */

import { decorateIcons } from '../../scripts/aem.js';
import {
  findNextHeading,
  filterData,
  fetchData,
  renderResult,
  parseSearchTerms,
  updateUrlWithQuery,
  getQueryFromUrl,
} from '../../scripts/search-utils.js';

/**
 * Default configuration for search block
 */
const CONFIG = {
  defaultSource: '/query-index.json',
  placeholders: {
    searchPlaceholder: 'Search...',
    searchNoResults: 'No results found.',
    viewAllButtonText: 'View all {count} results',
  },
  suggestionsLimit: 3,
  autosuggest: true,
  imageWidth: 320,
};

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
  updateUrlWithQuery('');
}

/**
 * Renders search results into the results container
 * @param {HTMLElement} block - The search block element
 * @param {Object} config - Search configuration object
 * @param {Array} filteredData - Filtered search results
 * @param {string[]} searchTerms - Array of search terms for highlighting
 * @param {boolean} showImages - Whether to include images in results
 */
async function renderResults(block, config, filteredData, searchTerms, showImages) {
  clearSearchResults(block);
  const searchResults = block.querySelector('.search-results');
  const headingTag = searchResults.dataset.h;

  // Show limited suggestions (max 5)
  const limit = config.suggestionsLimit || 5;
  const dataToRender = filteredData.slice(0, limit);

  if (dataToRender.length) {
    searchResults.classList.remove('no-results');
    dataToRender.forEach((result) => {
      const li = renderResult(result, searchTerms, headingTag, {
        showImages,
        imageWidth: CONFIG.imageWidth,
      });
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
      // Use configured button text or default
      const buttonText = config.placeholders.viewAllButtonText || CONFIG.placeholders.viewAllButtonText;
      viewAllLink.textContent = buttonText.replace('{count}', filteredData.length.toString());
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
 * Handles search input events
 * @param {Event} e - Input event
 * @param {HTMLElement} block - The search block element
 * @param {Object} config - Search configuration object
 */
async function handleSearch(e, block, config) {
  const searchValue = e.target.value;
  updateUrlWithQuery(searchValue);

  // If autosuggest is disabled, don't show inline results
  if (!config.autosuggest) {
    return;
  }

  if (searchValue.length < 3) {
    clearSearch(block);
    return;
  }

  const searchTerms = parseSearchTerms(searchValue);
  const data = await fetchData(config.source, { verbose: true });

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
  const showImages = block.classList.contains('cards') || block.classList.contains('minimal');
  await renderResults(block, config, filteredData, searchTerms, showImages);
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
        if (searchQuery.length >= 1) {
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
 * Calculates the height of the header element
 * @returns {number} The height of the header in pixels
 */
function calculateHeaderHeight() {
  const header = document.querySelector('header.block, header');
  if (!header) return 0;

  const navWrapper = header.querySelector('.nav-wrapper');
  if (navWrapper) {
    return navWrapper.offsetHeight;
  }

  return header.offsetHeight;
}

/**
 * Applies margin-top to search block based on header height when expanded
 * @param {HTMLElement} block - The search block element
 * @param {boolean} isExpanded - Whether the search block is expanded
 */
function applySearchBlockMargin(block, isExpanded) {
  if (!block) return;

  if (isExpanded) {
    const headerHeight = calculateHeaderHeight();
    block.style.marginTop = `${headerHeight}px`;
  } else {
    block.style.marginTop = '';
  }
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

  // Apply margin-top based on header height when expanded
  applySearchBlockMargin(block, newState);

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
 * Parses block configuration from block content
 * @param {HTMLElement} block - The block element
 * @returns {Object} Configuration object with autosuggest, resultPage, and placeholders
 */
function parseBlockConfig(block) {
  let { autosuggest } = CONFIG;
  let resultPage = null;
  const placeholders = { ...CONFIG.placeholders };

  const rows = [...block.children];

  // Collect all text values for single-column parsing
  const textValues = [];

  rows.forEach((row) => {
    const cells = [...row.children];

    if (cells.length >= 2) {
      // Two-column structure: label | value
      const label = cells[0].textContent.trim().toLowerCase();
      const valueCell = cells[1];
      const link = valueCell.querySelector('a[href]');
      const textContent = valueCell.textContent.trim().toLowerCase();

      if (label.includes('autosuggest') || label.includes('toggle') || label.includes('recommend')) {
        // Parse boolean value
        autosuggest = textContent === 'true' || textContent === '1' || textContent === 'yes' || textContent === 'on';
      } else if ((label.includes('result') || label.includes('page')) && link) {
        resultPage = link.href;
      } else if (label.includes('placeholder')) {
        placeholders.searchPlaceholder = valueCell.textContent.trim();
      } else if (label.includes('no results')) {
        placeholders.searchNoResults = valueCell.textContent.trim();
      } else if (label.includes('view all') || label.includes('button')) {
        placeholders.viewAllButtonText = valueCell.textContent.trim();
      }
    } else if (cells.length === 1) {
      // Single-column structure: collect values
      const cell = cells[0];
      const link = cell.querySelector('a[href]');
      const textContent = cell.textContent.trim();

      if (link) {
        // Link is likely the result page
        if (!resultPage) {
          resultPage = link.href;
        }
      } else if (textContent && textContent.length > 0) {
        // Check for boolean values first
        const lowerText = textContent.toLowerCase();
        if (lowerText === 'true' || lowerText === 'false') {
          autosuggest = lowerText === 'true';
        } else {
          textValues.push(textContent);
        }
      }
    }
  });

  // Assign remaining text values in order: searchPlaceholder, searchNoResults, viewAllButtonText
  if (textValues.length >= 1) {
    [placeholders.searchPlaceholder] = textValues;
  }
  if (textValues.length >= 2) {
    [placeholders.searchNoResults] = textValues;
  }
  if (textValues.length >= 3) {
    [placeholders.viewAllButtonText] = textValues;
  }

  return { autosuggest, resultPage, placeholders };
}

/**
 * Decorates the search block
 * @param {HTMLElement} block - The search block element
 */
export default async function decorate(block) {
  // Parse configuration from block content
  const { autosuggest, resultPage, placeholders } = parseBlockConfig(block);

  // Build configuration object (always use default query-index.json)
  const config = {
    source: CONFIG.defaultSource,
    autosuggest,
    resultPage,
    placeholders,
    suggestionsLimit: CONFIG.suggestionsLimit,
  };

  // Clear block content and build search UI
  block.innerHTML = '';

  // Add class for autosuggest mode
  if (!autosuggest) {
    block.classList.add('no-autosuggest');
  }

  // Build search UI elements
  const searchBoxElement = searchBox(block, config);
  block.append(searchBoxElement);

  // Only add results container if autosuggest is enabled
  if (autosuggest) {
    block.append(searchResultsContainer(block));
  }

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
  const queryParam = getQueryFromUrl();
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

  // Handle window resize to recalculate header height
  let resizeTimeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const isExpanded = block.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        applySearchBlockMargin(block, true);
      }
    }, 100);
  };

  window.addEventListener('resize', handleResize);

  decorateIcons(block);
}
