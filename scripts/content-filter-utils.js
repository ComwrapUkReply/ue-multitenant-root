/**
 * Content Filter Utilities Module
 * Generic tag-based filtering functionality for content blocks
 * @module content-filter-utils
 */

/**
 * Configuration object for content filter
 * @typedef {Object} ContentFilterConfig
 * @property {boolean} multipleSelect - Allow multiple tag selection
 * @property {Function} onFilter - Callback when filter changes
 * @property {string} filterAttribute - Data attribute containing tags (default: 'data-tags')
 * @property {string} tagDelimiter - Delimiter for tags in attribute (default: ', ')
 * @property {string} tagNamespaceSeparator - Separator for tag namespaces (default: ':')
 */

/**
 * Default configuration for content filter
 */
const DEFAULT_CONFIG = {
  multipleSelect: true,
  filterAttribute: 'data-tags',
  tagDelimiter: ', ',
  tagNamespaceSeparator: ':',
  onFilter: null,
};

/**
 * Extracts unique tags from content items
 * @param {NodeListOf<Element>|Element[]} items - Content items with tag data
 * @param {ContentFilterConfig} config - Filter configuration
 * @returns {string[]} Sorted array of unique tag names
 */
export function extractUniqueTags(items, config = DEFAULT_CONFIG) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const tagSet = new Set();

  items.forEach((item) => {
    const tagsAttr = item.getAttribute(mergedConfig.filterAttribute);
    if (tagsAttr) {
      const tags = tagsAttr
        .split(mergedConfig.tagDelimiter)
        .map((tag) => tag.split(mergedConfig.tagNamespaceSeparator).pop().trim())
        .filter(Boolean);
      tags.forEach((tag) => tagSet.add(tag));
    }
  });

  return [...tagSet].sort();
}

/**
 * Filters content items based on selected tags
 * @param {NodeListOf<Element>|Element[]} items - Content items to filter
 * @param {string[]} selectedTags - Array of selected tag names
 * @param {ContentFilterConfig} config - Filter configuration
 * @returns {Object} Object containing visible and hidden items
 */
export function filterContentByTags(items, selectedTags, config = DEFAULT_CONFIG) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const visibleItems = [];
  const hiddenItems = [];

  items.forEach((item) => {
    if (selectedTags.length === 0) {
      // Show all items if no tags selected
      visibleItems.push(item);
      return;
    }

    const tagsAttr = item.getAttribute(mergedConfig.filterAttribute);
    if (tagsAttr) {
      const itemTags = tagsAttr
        .split(mergedConfig.tagDelimiter)
        .map((tag) => tag.split(mergedConfig.tagNamespaceSeparator).pop().trim());

      // Show items that have ANY of the selected tags
      const hasSelectedTag = selectedTags.some((selectedTag) => itemTags.includes(selectedTag));

      if (hasSelectedTag) {
        visibleItems.push(item);
      } else {
        hiddenItems.push(item);
      }
    } else {
      hiddenItems.push(item);
    }
  });

  return { visibleItems, hiddenItems };
}

/**
 * Creates a tag filter button element
 * @param {string} tag - Tag name
 * @param {Object} options - Button options
 * @param {boolean} options.isActive - Whether button is active
 * @param {Function} options.onClick - Click handler
 * @returns {HTMLButtonElement} Tag filter button element
 */
export function createTagButton(tag, options = {}) {
  const { isActive = false, onClick = null } = options;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tag-filter-pill';
  button.innerHTML = `<span class="tag-filter-text">${tag}</span>`;
  button.setAttribute('data-tag', tag);
  button.setAttribute('aria-pressed', String(isActive));

  if (isActive) {
    button.classList.add('active');
  }

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

/**
 * Handles tag button click
 * @param {string} tag - Clicked tag name
 * @param {HTMLButtonElement} button - Clicked button element
 * @param {string[]} selectedTags - Array of currently selected tags
 * @param {HTMLElement} container - Tag filter container
 * @param {ContentFilterConfig} config - Filter configuration
 */
function handleTagClick(tag, button, selectedTags, container, config) {
  const tagIndex = selectedTags.indexOf(tag);

  if (config.multipleSelect) {
    // Multiple select mode: toggle selection
    if (tagIndex > -1) {
      selectedTags.splice(tagIndex, 1);
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
    } else {
      selectedTags.push(tag);
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
    }
  } else if (tagIndex > -1) {
    // Single select mode: deselect if clicking the active pill
    selectedTags.splice(tagIndex, 1);
    button.classList.remove('active');
    button.setAttribute('aria-pressed', 'false');
  } else {
    // Single select mode: deselect all others and select this one
    selectedTags.length = 0;
    selectedTags.push(tag);
    container.querySelectorAll('.tag-filter-pill').forEach((pill) => {
      pill.classList.remove('active');
      pill.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
  }

  // Trigger callback
  if (config.onFilter) {
    config.onFilter([...selectedTags]);
  }
}

/**
 * Creates a complete tag filter UI component
 * @param {string[]} tags - Array of tag names
 * @param {ContentFilterConfig} config - Filter configuration
 * @returns {Object} Object containing container element and control methods
 */
export function createTagFilterUI(tags, config = DEFAULT_CONFIG) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const selectedTags = [];

  // Create container
  const container = document.createElement('div');
  container.className = 'tag-filter-container';
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', 'Filter by tags');

  // Create tag buttons
  tags.forEach((tag) => {
    const button = createTagButton(tag, {
      isActive: false,
      onClick: (e) => {
        e.stopPropagation();
        handleTagClick(tag, button, selectedTags, container, mergedConfig);
      },
    });
    container.appendChild(button);
  });

  // Return container and control methods
  return {
    element: container,
    getSelectedTags: () => [...selectedTags],
    clearSelection: () => {
      selectedTags.length = 0;
      container.querySelectorAll('.tag-filter-pill').forEach((pill) => {
        pill.classList.remove('active');
        pill.setAttribute('aria-pressed', 'false');
      });
      if (mergedConfig.onFilter) {
        mergedConfig.onFilter([]);
      }
    },
    setSelection: (newTags) => {
      selectedTags.length = 0;
      selectedTags.push(...newTags);
      container.querySelectorAll('.tag-filter-pill').forEach((pill) => {
        const pillTag = pill.getAttribute('data-tag');
        const isSelected = newTags.includes(pillTag);
        pill.classList.toggle('active', isSelected);
        pill.setAttribute('aria-pressed', String(isSelected));
      });
      if (mergedConfig.onFilter) {
        mergedConfig.onFilter([...selectedTags]);
      }
    },
  };
}

/**
 * Parses tags from a data item object
 * @param {Object} item - Data item with tags property
 * @param {ContentFilterConfig} config - Filter configuration
 * @returns {string[]} Array of parsed tag names
 */
export function parseTagsFromItem(item, config = DEFAULT_CONFIG) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  if (!item.tags) {
    return [];
  }

  return item.tags
    .split(mergedConfig.tagDelimiter)
    .map((tag) => tag.split(mergedConfig.tagNamespaceSeparator).pop().trim())
    .filter(Boolean);
}

/**
 * Extracts unique tags from data array
 * @param {Array} data - Array of data items with tags property
 * @param {ContentFilterConfig} config - Filter configuration
 * @returns {string[]} Sorted array of unique tag names
 */
export function extractUniqueTagsFromData(data, config = DEFAULT_CONFIG) {
  const tagSet = new Set();

  data.forEach((item) => {
    const tags = parseTagsFromItem(item, config);
    tags.forEach((tag) => tagSet.add(tag));
  });

  return [...tagSet].sort();
}

/**
 * Filters data array based on selected tags
 * @param {Array} data - Array of data items to filter
 * @param {string[]} selectedTags - Array of selected tag names
 * @param {ContentFilterConfig} config - Filter configuration
 * @returns {Array} Filtered array of data items
 */
export function filterDataByTags(data, selectedTags, config = DEFAULT_CONFIG) {
  if (selectedTags.length === 0) {
    return data;
  }

  return data.filter((item) => {
    const itemTags = parseTagsFromItem(item, config);
    return selectedTags.some((selectedTag) => itemTags.includes(selectedTag));
  });
}

/**
 * Creates a "Clear All" button for tag filters
 * @param {Function} onClick - Click handler
 * @returns {HTMLButtonElement} Clear all button element
 */
export function createClearAllButton(onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tag-filter-clear';
  button.textContent = 'Clear All';
  button.setAttribute('aria-label', 'Clear all tag filters');

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}
