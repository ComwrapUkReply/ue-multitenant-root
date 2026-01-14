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
import {
  extractUniqueTagsFromData,
  createTagFilterUI,
  filterDataByTags,
  createClearAllButton,
} from '../../scripts/content-filter-utils.js';

/**
 * Default configuration for search results block
 */
const CONFIG = {
  defaultSource: '/query-index.json',
  itemsPerPage: 3,
  placeholders: {
    searchNoResultsFor: 'No results found for',
    searchResultsTitle: 'Search Results',
    searchPlaceholder: 'Search...',
  },
  imageWidth: 375,
};

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
    const { itemsPerPage } = CONFIG;
    const totalPages = Math.ceil(totalResults / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalResults);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Render paginated results
    paginatedData.forEach((result) => {
      const li = renderResult(result, searchTerms, headingTag, {
        showImages,
        imageWidth: CONFIG.imageWidth,
      });
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

      // Add tag filter info if active
      if (config.selectedTags && config.selectedTags.length > 0) {
        const tagList = config.selectedTags.join(', ');
        message += ` (filtered by: ${tagList})`;
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

      // Add tag filter info if active
      if (config.selectedTags && config.selectedTags.length > 0) {
        const tagList = config.selectedTags.join(', ');
        message += ` (filtered by: ${tagList})`;
      }

      resultsCount.textContent = message;
    }
  }
}

/**
 * Handles search execution with tag filtering support
 * @param {HTMLElement} block - The search results block element
 * @param {Object} config - Search configuration object
 * @param {string} searchValue - The search query
 * @param {Object} state - Shared state object for tag filtering
 */
async function executeSearch(block, config, searchValue, state = {}) {
  const searchTerms = parseSearchTerms(searchValue);

  // Show loading state
  const resultsContainer = block.querySelector('.search-results-list');
  resultsContainer.innerHTML = '<li class="loading">Loading results...</li>';

  // Hide tag filter during loading
  const tagFilterWrapper = block.querySelector('.search-results-tag-filter');
  if (tagFilterWrapper) {
    tagFilterWrapper.style.display = 'none';
  }

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
  let filteredData = filterData(searchTerms, dataToSearch);

  // Store filtered data in state for tag filtering
  if (state) {
    state.searchFilteredData = filteredData;
    state.searchTerms = searchTerms;
  }

  // Extract unique tags from search results and create/update tag filter
  if (config.enableTagFilter && filteredData.length > 0) {
    const uniqueTags = extractUniqueTagsFromData(filteredData);

    if (uniqueTags.length > 0) {
      // Show tag filter wrapper
      if (tagFilterWrapper) {
        tagFilterWrapper.style.display = '';

        // Update or create tag filter UI
        const existingTagFilter = tagFilterWrapper.querySelector('.tag-filter-container');
        if (existingTagFilter) {
          existingTagFilter.remove();
        }

        // Clear any existing clear button
        const existingClearBtn = tagFilterWrapper.querySelector('.tag-filter-clear');
        if (existingClearBtn) {
          existingClearBtn.remove();
        }

        // Reset selected tags
        state.selectedTags = [];

        const tagFilterUI = createTagFilterUI(uniqueTags, {
          multipleSelect: config.multipleTagSelect !== false,
          onFilter: (selectedTags) => {
            state.selectedTags = selectedTags;
            config.selectedTags = selectedTags;

            // Apply tag filtering to search results
            let tagFilteredData = state.searchFilteredData;
            if (selectedTags.length > 0) {
              tagFilteredData = filterDataByTags(state.searchFilteredData, selectedTags);
            }

            const headingTag = findNextHeading(block);
            const showImages = block.classList.contains('cards') || block.classList.contains('minimal');
            renderResults(block, config, tagFilteredData, state.searchTerms, headingTag, showImages);

            // Update clear button visibility
            const clearBtn = tagFilterWrapper.querySelector('.tag-filter-clear');
            if (clearBtn) {
              clearBtn.style.display = selectedTags.length > 0 ? '' : 'none';
            }
          },
        });

        // Create clear all button
        const clearAllBtn = createClearAllButton(() => {
          tagFilterUI.clearSelection();
        });
        clearAllBtn.style.display = 'none'; // Hidden initially

        tagFilterWrapper.appendChild(tagFilterUI.element);
        tagFilterWrapper.appendChild(clearAllBtn);
      }
    } else if (tagFilterWrapper) {
      // No tags found, hide filter
      tagFilterWrapper.style.display = 'none';
    }
  }

  // Apply tag filtering if tags are already selected
  if (state.selectedTags && state.selectedTags.length > 0) {
    filteredData = filterDataByTags(filteredData, state.selectedTags);
    config.selectedTags = state.selectedTags;
  }

  const headingTag = findNextHeading(block);
  const showImages = block.classList.contains('cards') || block.classList.contains('minimal');
  renderResults(block, config, filteredData, searchTerms, headingTag, showImages);
}

/**
 * Creates the search input element for results page
 * @param {HTMLElement} block - The search results block element
 * @param {Object} config - Search configuration object
 * @param {Object} state - Shared state object
 * @returns {HTMLInputElement} Search input element
 */
function createSearchInput(block, config, state) {
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
    updateUrlWithQuery(searchValue);

    // Debounce search
    clearTimeout(searchTimeout);
    if (searchValue.length >= 3) {
      searchTimeout = setTimeout(() => {
        executeSearch(block, config, searchValue, state);
      }, 300);
    } else if (searchValue.length === 0) {
      // Clear results if search is empty
      const resultsContainer = block.querySelector('.search-results-list');
      resultsContainer.innerHTML = '';
      const resultsCount = block.querySelector('.search-results-count');
      if (resultsCount) {
        resultsCount.textContent = '';
      }
      // Hide tag filter
      const tagFilterWrapper = block.querySelector('.search-results-tag-filter');
      if (tagFilterWrapper) {
        tagFilterWrapper.style.display = 'none';
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
 * Extracts enableTagFilter value from block content
 * @param {HTMLElement} block - The block element
 * @returns {boolean} Whether tag filtering is enabled
 */
function extractEnableTagFilter(block) {
  const allDivs = [...block.querySelectorAll('div')];
  const tagFilterDiv = allDivs.find((div) => {
    const text = div.textContent.trim().toLowerCase();
    return text === 'enabletagfilter' || text === 'enable tag filter' || text === 'tag filter';
  });

  if (tagFilterDiv && tagFilterDiv.nextElementSibling) {
    const value = tagFilterDiv.nextElementSibling.textContent.trim().toLowerCase();
    return value === 'true' || value === 'yes' || value === '1';
  }

  // Check for boolean value in block content
  const booleanDiv = allDivs.find((div) => {
    const text = div.textContent.trim().toLowerCase();
    return text === 'true' || text === 'false';
  });

  if (booleanDiv) {
    return booleanDiv.textContent.trim().toLowerCase() === 'true';
  }

  return false;
}

/**
 * Checks if a value is a boolean string
 * @param {string} value - The value to check
 * @returns {boolean} True if value is a boolean string
 */
function isBooleanString(value) {
  const lowerValue = value.toLowerCase();
  return lowerValue === 'true' || lowerValue === 'false';
}

/**
 * Parses a boolean value from string
 * @param {string} value - The value to parse
 * @returns {boolean} Parsed boolean value
 */
function parseBooleanValue(value) {
  const lowerValue = value.toLowerCase();
  return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1';
}

/**
 * Parses block configuration from block content
 * AEM renders block fields in order as rows with single cells containing the value
 * Field order from _search-results.json:
 * 1. folder (aem-content - link)
 * 2. classes (select - text)
 * 3. enableTagFilter (boolean - true/false)
 * 4. multipleTagSelect (boolean - true/false)
 * 5. searchPlaceholder (text)
 * 6. searchNoResultsFor (text)
 * 7. searchResultsTitle (text)
 * @param {HTMLElement} block - The block element
 * @returns {Object} Configuration object with folders, placeholders, classes, and enableTagFilter
 */
function parseBlockConfig(block) {
  let folders = [];
  let classes = '';
  let enableTagFilter = false;
  let multipleTagSelect = true;
  const placeholders = { ...CONFIG.placeholders };

  const rows = [...block.children];

  // Collect values from rows in order
  const values = [];

  rows.forEach((row) => {
    const cells = [...row.children];

    if (cells.length >= 2) {
      // Two-column structure: label | value (key-value format)
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
        classes = textContent.trim();
      } else if ((label.includes('searchnoresultsfor') || (label.includes('no results') && label.includes('for'))) && textContent) {
        placeholders.searchNoResultsFor = textContent;
      } else if ((label.includes('searchresultstitle') || label.includes('search results title')) && textContent) {
        placeholders.searchResultsTitle = textContent;
      } else if ((label.includes('searchplaceholder') || label.includes('search placeholder')) && textContent) {
        placeholders.searchPlaceholder = textContent;
      } else if (label.includes('enabletagfilter') || label.includes('tag filter')) {
        enableTagFilter = parseBooleanValue(textContent);
      } else if (label.includes('multipletagselect') || (label.includes('multiple') && label.includes('select'))) {
        multipleTagSelect = parseBooleanValue(textContent);
      }
    } else if (cells.length === 1) {
      // Single-column structure: just the value
      const cell = cells[0];
      const link = cell.querySelector('a[href]');
      const textContent = cell.textContent.trim();

      if (link && link.href) {
        // This is a link (folder path)
        values.push({ type: 'link', value: extractPathname(link.href) });
      } else if (textContent && textContent.length > 0) {
        // Check if it's a boolean, known class, or text
        if (isBooleanString(textContent)) {
          values.push({ type: 'boolean', value: parseBooleanValue(textContent) });
        } else if (['cards', 'minimal'].includes(textContent.toLowerCase())) {
          values.push({ type: 'class', value: textContent });
        } else {
          values.push({ type: 'text', value: textContent });
        }
      }
    }
  });

  // Process single-column values in order based on field definition
  // Field order: folder, classes, enableTagFilter, multipleTagSelect, searchPlaceholder, searchNoResultsFor, searchResultsTitle
  let linkIndex = 0;
  let classIndex = 0;
  let booleanIndex = 0;
  let textIndex = 0;

  const links = values.filter((v) => v.type === 'link');
  const knownClasses = values.filter((v) => v.type === 'class');
  const booleans = values.filter((v) => v.type === 'boolean');
  const texts = values.filter((v) => v.type === 'text');

  // Assign folder from first link if not already set
  if (folders.length === 0 && links.length > linkIndex) {
    const folderValue = links[linkIndex].value;
    linkIndex += 1;
    folders = folderValue
      .split(',')
      .map((f) => transformAEMPath(f))
      .filter((f) => f.length > 0);
  }

  // Assign classes from first known class if not already set
  if (!classes && knownClasses.length > classIndex) {
    classes = knownClasses[classIndex].value;
    classIndex += 1;
  }

  // Assign booleans in order: enableTagFilter, multipleTagSelect
  if (booleans.length > booleanIndex) {
    enableTagFilter = booleans[booleanIndex].value;
    booleanIndex += 1;
  }
  if (booleans.length > booleanIndex) {
    multipleTagSelect = booleans[booleanIndex].value;
    booleanIndex += 1;
  }

  // Assign text values in order: searchPlaceholder, searchNoResultsFor, searchResultsTitle
  if (texts.length > textIndex && placeholders.searchPlaceholder === CONFIG.placeholders.searchPlaceholder) {
    placeholders.searchPlaceholder = texts[textIndex].value;
    textIndex += 1;
  }
  if (texts.length > textIndex && placeholders.searchNoResultsFor === CONFIG.placeholders.searchNoResultsFor) {
    placeholders.searchNoResultsFor = texts[textIndex].value;
    textIndex += 1;
  }
  if (texts.length > textIndex && placeholders.searchResultsTitle === CONFIG.placeholders.searchResultsTitle) {
    placeholders.searchResultsTitle = texts[textIndex].value;
    textIndex += 1;
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

  // Fallback: try to extract enableTagFilter using direct DOM search
  if (!enableTagFilter) {
    enableTagFilter = extractEnableTagFilter(block);
  }

  // Also check for block class to enable tag filter
  if (block.classList.contains('with-filter') || block.classList.contains('tag-filter')) {
    enableTagFilter = true;
  }

  return {
    folders,
    placeholders,
    classes,
    enableTagFilter,
    multipleTagSelect,
  };
}

/**
 * Decorates the search results block
 * @param {HTMLElement} block - The search results block element
 */
export default async function decorate(block) {
  // Parse configuration from block content
  const {
    folders,
    placeholders,
    classes,
    enableTagFilter,
    multipleTagSelect,
  } = parseBlockConfig(block);

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
    enableTagFilter,
    multipleTagSelect,
    selectedTags: [],
  };

  // Shared state for search and tag filtering
  const state = {
    searchFilteredData: [],
    searchTerms: [],
    selectedTags: [],
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
    createSearchInput(block, config, state),
  );

  // Create tag filter wrapper (hidden by default, shown when search has results)
  const tagFilterWrapper = document.createElement('div');
  tagFilterWrapper.className = 'search-results-tag-filter';
  tagFilterWrapper.style.display = 'none';
  tagFilterWrapper.setAttribute('aria-label', 'Filter results by tags');

  // Create results count
  const resultsCount = document.createElement('div');
  resultsCount.className = 'search-results-count';

  // Create results list
  const resultsList = document.createElement('ul');
  resultsList.className = 'search-results-list';

  // Append elements in order
  block.append(title, searchBox);

  // Add tag filter wrapper if enabled
  if (enableTagFilter) {
    block.append(tagFilterWrapper);
  }

  block.append(resultsCount, resultsList);

  decorateIcons(block);

  // Execute search if query parameter exists
  const queryParam = getQueryFromUrl();
  if (queryParam && queryParam.length >= 3) {
    const input = block.querySelector('.search-results-input');
    if (input) {
      input.value = queryParam;
      await executeSearch(block, config, queryParam, state);
    }
  }
}
