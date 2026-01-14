import { getCurrentCountryLanguage } from '../helpers.js';
import { isEditorMode, isAuthorMode } from '../../scripts/utils.js';
import { previewURL } from '../../scripts/constants.js';
import {
  extractUniqueTagsFromData,
  createTagFilterUI,
  filterDataByTags,
} from '../../scripts/content-filter-utils.js';

/**
 * Configuration for dynamic content block
 */
const CONFIG = {
  selectors: {
    contentContainer: '.content-container',
    referenceLink: 'a',
  },
  classes: {
    content: 'content',
    contentBody: 'content-body',
    contentTitle: 'content-title',
    description: 'description',
    tagsContainer: 'tags-container',
    tagPill: 'tag-pill',
    button: 'button',
    buttonPrimary: 'primary',
  },
};

/**
 * Creates a content card element
 * @param {Object} content - Content data object
 * @returns {HTMLAnchorElement} Content card link element
 */
function createContentCard(content) {
  const contentLink = document.createElement('a');
  contentLink.href = content.path;

  const contentElement = document.createElement('content');
  contentElement.classList.add(CONFIG.classes.content);
  contentLink.appendChild(contentElement);

  // Image
  if (content.image) {
    const image = document.createElement('img');
    image.src = content.image;
    image.alt = content.title;
    contentElement.appendChild(image);
  }

  // Content body
  const contentBody = document.createElement('div');
  contentBody.classList.add(CONFIG.classes.contentBody);
  contentElement.appendChild(contentBody);

  // Title
  const title = document.createElement('p');
  title.classList.add(CONFIG.classes.contentTitle);
  title.textContent = content.title;
  contentBody.appendChild(title);

  // Description
  if (content.description) {
    const contentDescription = document.createElement('p');
    contentDescription.classList.add(CONFIG.classes.description);
    contentDescription.textContent = content.description;
    contentBody.appendChild(contentDescription);
  }

  // Tags
  if (content.tags) {
    const tagsContainer = document.createElement('div');
    tagsContainer.classList.add(CONFIG.classes.tagsContainer);
    const tagArray = content.tags.split(', ').filter((tag) => tag.trim());
    tagArray.forEach((tag) => {
      const tagPill = document.createElement('span');
      tagPill.classList.add(CONFIG.classes.tagPill);
      tagPill.textContent = tag.split(':').pop().trim();
      tagsContainer.appendChild(tagPill);
    });
    contentBody.appendChild(tagsContainer);
  }

  // Read more button
  const readMoreButton = document.createElement('a');
  readMoreButton.classList.add(CONFIG.classes.button, CONFIG.classes.buttonPrimary);
  readMoreButton.textContent = 'Read more';
  readMoreButton.href = content.path;
  contentBody.appendChild(readMoreButton);

  // Add data-tags attribute for filtering
  if (content.tags) {
    contentLink.setAttribute('data-tags', content.tags);
  }

  return contentLink;
}

/**
 * Renders content items to the container
 * @param {HTMLElement} container - Container element
 * @param {Array} contentItems - Array of content data
 */
function renderContent(container, contentItems) {
  container.innerHTML = '';
  contentItems.forEach((content) => {
    const card = createContentCard(content);
    container.appendChild(card);
  });
}

/**
 * Filters content data based on reference path
 * @param {Array} data - Raw content data
 * @param {string} referencePath - Path to filter by
 * @returns {Array} Filtered content data
 */
function filterContentByPath(data, referencePath) {
  return data.filter((content) => {
    const { path, title } = content;
    return path.includes(`${referencePath}/`)
      && !title.includes('Index')
      && !path.includes('/nav')
      && !path.includes('/footer')
      && (!referencePath || path.startsWith(referencePath));
  });
}

export default async function decorate(block) {
  // Show placeholder in editor mode
  if (isEditorMode() || isAuthorMode()) {
    block.innerHTML = `Dynamic Content and Content Filtering are not available in editor mode. <br> Please publish the page to preview and go to <a href="${previewURL}" target="_blank">${previewURL}</a>`;
    block.style.textAlign = 'center';
    block.style.padding = '20px';
    block.style.border = '1px solid #ccc';
    block.style.borderRadius = '5px';
    block.style.backgroundColor = '#f0f0f0';
    block.style.color = '#333';
    block.style.fontSize = '16px';
    return;
  }

  // Get reference path from block content
  const referenceLink = block.querySelector(CONFIG.selectors.referenceLink);
  const referencePath = referenceLink
    ? referenceLink.getAttribute('href').replace('/content/ue-multitenant-root', '')
    : '';

  // Fetch content data
  const [currentCountry, currentLanguage] = getCurrentCountryLanguage();
  let response = await fetch('/query-index.json');

  if (currentCountry && currentLanguage) {
    response = await fetch('/query-index.json');
  }

  const dynamicContentRaw = await response.json();

  // Filter content by path
  const dynamicContent = filterContentByPath(dynamicContentRaw.data, referencePath);

  // Check if tag filtering is enabled (via block class or config)
  const enableTagFilter = block.classList.contains('with-filter');

  // Clear block and create container
  block.textContent = '';

  // Create tag filter UI if enabled
  if (enableTagFilter && dynamicContent.length > 0) {
    const uniqueTags = extractUniqueTagsFromData(dynamicContent);

    if (uniqueTags.length > 0) {
      const contentContainer = document.createElement('div');
      contentContainer.classList.add('content-container');

      const tagFilterUI = createTagFilterUI(uniqueTags, {
        multipleSelect: true,
        onFilter: (selectedTags) => {
          const filteredContent = filterDataByTags(dynamicContent, selectedTags);
          renderContent(contentContainer, filteredContent);
        },
      });

      block.appendChild(tagFilterUI.element);
      block.appendChild(contentContainer);

      // Initial render
      renderContent(contentContainer, dynamicContent);
      return;
    }
  }

  // Standard rendering without filter
  const container = document.createElement('div');
  container.classList.add('content-container');

  dynamicContent.forEach((content) => {
    const card = createContentCard(content);
    container.appendChild(card);
  });

  block.appendChild(container);
}
