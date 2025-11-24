import {
  decorateBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  loadBlock,
  loadScript,
  loadSections,
} from './aem.js';
import { decorateRichtext } from './editor-support-rte.js';
import { decorateMain } from './scripts.js';

async function applyChanges(event) {
  // redecorate default content and blocks on patches (in the properties rail)
  const { detail } = event;

  const resource = detail?.request?.target?.resource // update, patch components
    || detail?.request?.target?.container?.resource // update, patch, add to sections
    || detail?.request?.to?.container?.resource; // move in sections
  if (!resource) return false;
  const updates = detail?.response?.updates;
  if (!updates.length) return false;
  const { content } = updates[0];
  if (!content) return false;

  // load dompurify
  await loadScript(`${window.hlx.codeBasePath}/scripts/dompurify.min.js`);

  const sanitizedContent = window.DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
  const parsedUpdate = new DOMParser().parseFromString(sanitizedContent, 'text/html');
  const element = document.querySelector(`[data-aue-resource="${resource}"]`);

  if (element) {
    if (element.matches('main')) {
      const newMain = parsedUpdate.querySelector(`[data-aue-resource="${resource}"]`);
      newMain.style.display = 'none';
      element.insertAdjacentElement('afterend', newMain);
      decorateMain(newMain);
      decorateRichtext(newMain);
      await loadSections(newMain);
      element.remove();
      newMain.style.display = null;
      // eslint-disable-next-line no-use-before-define
      attachEventListners(newMain);
      return true;
    }

    const block = element.parentElement?.closest('.block[data-aue-resource]') || element?.closest('.block[data-aue-resource]');
    if (block) {
      const blockResource = block.getAttribute('data-aue-resource');
      const newBlock = parsedUpdate.querySelector(`[data-aue-resource="${blockResource}"]`);
      if (newBlock) {
        newBlock.style.display = 'none';
        block.insertAdjacentElement('afterend', newBlock);
        decorateButtons(newBlock);
        decorateIcons(newBlock);
        decorateBlock(newBlock);
        decorateRichtext(newBlock);
        await loadBlock(newBlock);
        block.remove();
        newBlock.style.display = null;
        return true;
      }
    } else {
      // sections and default content, may be multiple in the case of richtext
      const newElements = parsedUpdate.querySelectorAll(`[data-aue-resource="${resource}"],[data-richtext-resource="${resource}"]`);
      if (newElements.length) {
        const { parentElement } = element;
        if (element.matches('.section')) {
          const [newSection] = newElements;
          newSection.style.display = 'none';
          element.insertAdjacentElement('afterend', newSection);
          decorateButtons(newSection);
          decorateIcons(newSection);
          decorateRichtext(newSection);
          decorateSections(parentElement);
          decorateBlocks(parentElement);
          await loadSections(parentElement);
          element.remove();
          newSection.style.display = null;
        } else {
          element.replaceWith(...newElements);
          decorateButtons(parentElement);
          decorateIcons(parentElement);
          decorateRichtext(parentElement);
        }
        return true;
      }
    }
  }

  return false;
}

// /**
//  * Fetches current user and their group memberships
//  * @returns {Promise<Object>} User data including group memberships
//  */
// async function getCurrentUser() {
//   try {
//     const response = await fetch('/libs/granite/security/currentuser.json?props=memberOf');
//     if (!response.ok) throw new Error('Failed to fetch user data');
//     return await response.json();
//   } catch (error) {
//     // console.error('Error fetching user data:', error);
//     return null;
//   }
// }

// set the filter for an UE editable
function setUEFilter(element, filter) {
  element.dataset.aueFilter = filter;
}

async function updateUEInstrumentation() {
  const main = document.querySelector('main');
  // ----- if browse page, identified by theme
  if (document.querySelector('body[class^=browse-]')) {
    // if there is already a editable browse rail on the page
    const copyrightTextBlock = main.querySelector('div.copyright-text.block[data-aue-resource]');
    if (copyrightTextBlock) {
      // no more browse rails can be added
      setUEFilter(document.querySelector('.copyright-text'), 'empty');
    }

    // Update available blocks for tab sections
    const tabSections = main.querySelectorAll('div[data-aue-model^="tab-section"]');
    if (tabSections) {
      tabSections.forEach((elem) => {
        setUEFilter(elem, 'tab-section');
      });
    }

    // Update available blocks for default sections excluding browse-rail-section and tab-section
    main.querySelectorAll('.section:not(.one-column-section):not([data-aue-model^="teaser"])').forEach((elem) => {
      setUEFilter(elem, 'section-browse');
    });
  }
}

async function updateFooterFilter() {
  const main = document.querySelector('main');
  if (document.querySelector('body[class^=footer]')) {
    if (main) {
      setUEFilter(main, 'mainfooter');
      main.querySelectorAll('.section').forEach((section, index) => {
        if (index > 1) {
          section.remove();
          main.addEventListener('aue:content-add', () => {
            console.log('ADDING THE SECTION WITH aue:content-add');
            main.disabled = true;
          });
        }
      });
    }
  }
}

function attachEventListners(main) {
  [
    'aue:content-patch',
    'aue:content-update',
    'aue:content-add',
    'aue:content-move',
    'aue:content-remove',
    'aue:content-copy',
  ].forEach((eventType) => main?.addEventListener(eventType, async (event) => {
    event.stopPropagation();
    const applied = await applyChanges(event);
    if (applied) {
      updateFooterFilter();
      updateUEInstrumentation();
    } else {
      window.location.reload();
    }
  }));
}
updateFooterFilter();

attachEventListners(document.querySelector('main'));
