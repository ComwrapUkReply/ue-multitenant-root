import useBlockConfig from '../../scripts/global/useBlockConfig.js';
import {
  createImageWithModal,
  getQueryIndex,
  getDictionary,
  mapPath,
} from '../helpers.js';

const TEASER_LIST_BUTTON_LABEL = 'Read more';
const BLOCK_CONFIG = Object.freeze({
  empty: false,
  FIELDS: {
    TEASER_LIST_TYPE: {
      index: 0,
      removeRow: true,
    },
    TEASER_PARENT_PAGE_LINK: {
      index: 1,
      removeRow: true,
    },
    TEASER_INDIVIDUAL_PAGES_LINK: {
      index: 2,
      removeRow: true,
    },
    TEASER_TAG: {
      index: 3,
      removeRow: true,
    },
    TEASERS_TITLE_ELEMENT: {
      index: 4,
      removeRow: true,
    },
    TEASERS_LINK_LABEL: {
      index: 5,
      removeRow: true,
    },
  },
});

/**
 * Decorates the block.
 * @param {HTMLElement} block The block element
 */
export default async function decorate(block) {
  const {
    TEASER_LIST_TYPE,
    TEASER_PARENT_PAGE_LINK,
    TEASER_INDIVIDUAL_PAGES_LINK,
    TEASER_TAG,
    TEASERS_TITLE_ELEMENT,
    TEASERS_LINK_LABEL,
  } = useBlockConfig(block, BLOCK_CONFIG);

  const dictionary = await getDictionary();
  const button = dictionary?.teaserlist?.button || {};

  let pagesData = [];
  let data = [];

  try {
    data = await getQueryIndex();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load query index:', error);
    const errorMessage = document.createElement('div');
    errorMessage.className = 'teaser-list-empty';
    errorMessage.innerHTML = '<p>Unable to load page data. Please ensure the query-index.json file is available and published.</p>';
    block.appendChild(errorMessage);
    return;
  }

  // Ensure data is an array
  if (!Array.isArray(data)) {
    // eslint-disable-next-line no-console
    console.warn('Query index data is not an array:', data);
    data = [];
  }

  // Handle empty/unconfigured state
  if (!TEASER_LIST_TYPE.text || TEASER_LIST_TYPE.text.trim() === '') {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'teaser-list-empty';
    emptyMessage.innerHTML = '<p>Please configure the Teaser List block by selecting "Get Pages By" option in the properties panel.</p>';
    block.appendChild(emptyMessage);
    return;
  }

  if (TEASER_LIST_TYPE.text === 'parent_page') {
    const teaserParentPath = TEASER_PARENT_PAGE_LINK.text;
    if (!teaserParentPath || teaserParentPath.trim() === '') {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'teaser-list-empty';
      emptyMessage.innerHTML = '<p>Please configure the "Parent page" field in the properties panel.</p>';
      block.appendChild(emptyMessage);
      return;
    }
    const teaserParentLink = mapPath(teaserParentPath);
    pagesData = data.filter(
      (page) => page.path
      && page.path.startsWith(teaserParentLink)
      && page.path !== teaserParentLink,
    );
  } else if (TEASER_LIST_TYPE.text === 'individual_pages') {
    const individualPagesLinks = TEASER_INDIVIDUAL_PAGES_LINK.node?.innerText;
    if (!individualPagesLinks || individualPagesLinks.trim() === '') {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'teaser-list-empty';
      emptyMessage.innerHTML = '<p>Please configure the "Individual pages link" field in the properties panel.</p>';
      block.appendChild(emptyMessage);
      return;
    }
    const individualPaths = individualPagesLinks
      .split(',')
      .map((link) => link.trim())
      .filter((link) => link.length > 0)
      .map((link) => {
        const cleanPath = mapPath(link);
        return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
      });

    pagesData = data.filter((page) => page.path && individualPaths.includes(page.path));
    pagesData.sort((a, b) => {
      const aIndex = individualPaths.indexOf(a.path);
      const bIndex = individualPaths.indexOf(b.path);
      return aIndex - bIndex;
    });
  } else if (TEASER_LIST_TYPE.text === 'tag') {
    const teaserTag = TEASER_TAG.text;
    if (!teaserTag || teaserTag.trim() === '') {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'teaser-list-empty';
      emptyMessage.innerHTML = '<p>Please configure the "tags" field in the properties panel.</p>';
      block.appendChild(emptyMessage);
      return;
    }
    const teaserTags = teaserTag.split(',');
    pagesData = data.filter(
      (page) => Array.isArray(page.tags) && page.tags.length > 0 && page.tags[0]
      && page.tags[0].split(',').map((tag) => tag.trim()).some((tag) => teaserTags.includes(tag)),
    );
  }

  // Show message if no pages found
  if (pagesData.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'teaser-list-empty';
    emptyMessage.innerHTML = '<p>No pages found. Please check your configuration and ensure pages are published.</p>';
    block.appendChild(emptyMessage);
    return;
  }

  const teaserList = document.createElement('div');
  teaserList.className = 'teaser-list-inner';
  pagesData.forEach((page) => {
    const teaserImage = page.teaserimage || page.image;
    const title = page.teasertitle || page.title;
    const image = createImageWithModal(teaserImage, title, '16-9');

    const titleElement = TEASERS_TITLE_ELEMENT.text || 'h3';

    const description = page.teaserdescription || page.description;
    const teaserListItem = document.createRange().createContextualFragment(`
      <article class="teaser">
        <div class="teaser-image" role="img" aria-label="${title}"></div>
        <div class="teaser-title">
          <${titleElement} class="teaser-headline heading-responsive-4-3">${title}</${titleElement}>
        </div>
        <div class="teaser-description">
          <p>${description}</p>
        </div>
        <div class="teaser-button-container showarrow">
          <a
            href="${page.path || '#'}" 
            class="button" 
            aria-label="${TEASERS_LINK_LABEL.text || button?.label || TEASER_LIST_BUTTON_LABEL}"
            ${!page.path ? 'aria-disabled="true"' : ''}
          >
            <span>${TEASERS_LINK_LABEL.text || button?.label || TEASER_LIST_BUTTON_LABEL}</span>
          </a>
        </div>
      </article>
    `).firstElementChild;
    const imageContainer = teaserListItem.querySelector('.teaser-image');
    if (image) {
      imageContainer.appendChild(image);
    }
    teaserList.appendChild(teaserListItem);
  });

  block.appendChild(teaserList);
}
