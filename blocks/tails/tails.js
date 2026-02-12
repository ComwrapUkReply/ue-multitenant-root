import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Configuration constants for tails tab block
 */
const config = {
  activeClass: 'active',
  tabButtonClass: 'tails-tab-button',
  tabPanelClass: 'tails-tab-panel',
};

/**
 * Generates a unique ID for tab panels and buttons
 * @returns {string} Unique identifier
 */
const generateUniqueId = () => `tail-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Extracts tail data from the block structure.
 * Each row = one tail: first cell = title, remaining cells = content (image + body).
 * @param {Element} block - The block element
 * @returns {Array<{title: string, content: string, row: Element}>} Array of tail objects
 */
const extractTailsData = (block) => {
  const rows = [...block.children];

  return rows.reduce((tails, row) => {
    const cells = [...row.children];

    if (cells.length >= 1) {
      const titleCell = cells[0];
      const title = titleCell?.textContent?.trim() ?? '';
      // Content = remaining cells (image + body) as HTML
      const contentCells = cells.slice(1);
      const content = contentCells.length > 0
        ? contentCells.map((cell) => cell.outerHTML).join('')
        : '';

      tails.push({
        title: title || 'Tab',
        content,
        row,
      });
    }

    return tails;
  }, []);
};

/**
 * Creates the tab list structure with indicator
 * @returns {{ tabList: Element, indicator: Element, tabButtonsWrapper: Element }}
 */
const createTabList = () => {
  const tabList = document.createElement('div');
  tabList.className = 'tails-tab-list';
  tabList.setAttribute('role', 'tablist');
  tabList.setAttribute('aria-label', 'Tails tabs');

  const indicator = document.createElement('div');
  indicator.className = 'tails-indicator';
  indicator.setAttribute('aria-hidden', 'true');

  const tabButtonsWrapper = document.createElement('div');
  tabButtonsWrapper.className = 'tails-tab-buttons-wrapper';

  tabList.append(indicator, tabButtonsWrapper);

  return { tabList, indicator, tabButtonsWrapper };
};

/**
 * Creates a tab button element for a tail
 * @param {string} title - Tab title
 * @param {string} uniqueId - Unique identifier for the tab
 * @param {boolean} isActive - Whether this tab is active
 * @param {Element} row - Original row element for instrumentation
 * @returns {Element} Tab button element
 */
const createTabButton = (title, uniqueId, isActive, row) => {
  const button = document.createElement('button');
  button.className = config.tabButtonClass;
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-selected', isActive);
  button.setAttribute('aria-controls', uniqueId);
  button.setAttribute('id', `${uniqueId}-button`);
  button.setAttribute('type', 'button');
  button.tabIndex = isActive ? 0 : -1;

  const buttonContent = document.createElement('span');
  buttonContent.className = 'tails-tab-button-content';
  buttonContent.textContent = title;
  button.appendChild(buttonContent);

  if (isActive) {
    button.classList.add(config.activeClass);
  }

  moveInstrumentation(row, button);

  return button;
};

/**
 * Creates a tab panel element with tail content
 * @param {string} content - Panel HTML content (image + body)
 * @param {string} uniqueId - Unique identifier for the tab
 * @param {boolean} isActive - Whether this panel is active
 * @returns {Element} Tab panel element
 */
const createTabPanel = (content, uniqueId, isActive) => {
  const panel = document.createElement('div');
  panel.className = config.tabPanelClass;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('id', uniqueId);
  panel.setAttribute('aria-labelledby', `${uniqueId}-button`);
  panel.tabIndex = 0;
  panel.innerHTML = content;

  if (!isActive) {
    panel.setAttribute('hidden', '');
  } else {
    panel.classList.add(config.activeClass);
  }

  return panel;
};

/**
 * Updates the indicator position to match the active button
 * @param {Element} indicator - Indicator element
 * @param {Element} activeButton - Active button element
 */
const updateIndicator = (indicator, activeButton) => {
  const { offsetTop: top, offsetHeight: height } = activeButton;
  indicator.style.top = `${top}px`;
  indicator.style.height = `${height}px`;
};

/**
 * Switches active tab from one button to another
 * @param {Element} fromButton - Current active button
 * @param {Element} toButton - Button to activate
 * @param {Element} indicator - Indicator element
 */
const switchTab = (fromButton, toButton, indicator) => {
  const fromPanel = document.getElementById(fromButton.getAttribute('aria-controls'));
  const toPanel = document.getElementById(toButton.getAttribute('aria-controls'));

  if (!fromPanel || !toPanel) return;

  // Update buttons
  fromButton.setAttribute('aria-selected', 'false');
  fromButton.classList.remove(config.activeClass);
  fromButton.tabIndex = -1;

  toButton.setAttribute('aria-selected', 'true');
  toButton.classList.add(config.activeClass);
  toButton.tabIndex = 0;
  toButton.focus();

  // Update panels
  fromPanel.setAttribute('hidden', '');
  fromPanel.classList.remove(config.activeClass);

  toPanel.removeAttribute('hidden');
  toPanel.classList.add(config.activeClass);

  updateIndicator(indicator, toButton);
};

/**
 * Handles keyboard navigation for tab list
 * @param {KeyboardEvent} event - Keyboard event
 * @param {Element} currentButton - Current focused button
 * @param {Element[]} buttons - All tab buttons
 * @param {Element} indicator - Indicator element
 */
const handleKeyboardNavigation = (event, currentButton, buttons, indicator) => {
  const currentIndex = buttons.indexOf(currentButton);
  let nextIndex;

  const keyActions = {
    ArrowDown: () => (currentIndex + 1) % buttons.length,
    ArrowRight: () => (currentIndex + 1) % buttons.length,
    ArrowUp: () => (currentIndex - 1 + buttons.length) % buttons.length,
    ArrowLeft: () => (currentIndex - 1 + buttons.length) % buttons.length,
    Home: () => 0,
    End: () => buttons.length - 1,
  };

  if (keyActions[event.key]) {
    event.preventDefault();
    nextIndex = keyActions[event.key]();
    switchTab(currentButton, buttons[nextIndex], indicator);
  }
};

/**
 * Applies semantic classes to tail content inside a panel (image vs body)
 * @param {Element} panel - Tab panel element
 */
const decoratePanelContent = (panel) => {
  [...panel.children].forEach((div) => {
    if (div.children.length === 1 && div.querySelector('picture')) {
      div.className = 'tails-tail-image';
    } else {
      div.className = 'tails-tail-body';
    }
  });
};

/**
 * Optimizes images inside tab panels
 * @param {Element} container - Container holding panels
 */
const optimizePanelImages = (container) => {
  container.querySelectorAll(`${config.tabPanelClass} picture > img`).forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
};

/**
 * Decorates the tails block with tab functionality
 * @param {Element} block - The block element
 */
export default function decorate(block) {
  const tailsData = extractTailsData(block);

  if (tailsData.length === 0) {
    return;
  }

  const tailsContainer = document.createElement('div');
  tailsContainer.className = 'tails-block';

  const { tabList, indicator, tabButtonsWrapper } = createTabList();

  const tabPanelsContainer = document.createElement('div');
  tabPanelsContainer.className = 'tails-tab-panels';

  const tabs = tailsData.map((tailData, index) => {
    const uniqueId = generateUniqueId();
    const { title, content, row } = tailData;
    const isActive = index === 0;

    const button = createTabButton(title, uniqueId, isActive, row);
    const panel = createTabPanel(content, uniqueId, isActive);

    return { button, panel };
  });

  tabs.forEach(({ button, panel }) => {
    tabButtonsWrapper.appendChild(button);
    decoratePanelContent(panel);
    tabPanelsContainer.appendChild(panel);
  });

  optimizePanelImages(tabPanelsContainer);

  const allButtons = [...tabButtonsWrapper.querySelectorAll(`.${config.tabButtonClass}`)];

  tabs.forEach(({ button }) => {
    button.addEventListener('click', () => {
      const currentActiveButton = tabButtonsWrapper.querySelector(
        `.${config.tabButtonClass}.${config.activeClass}`,
      );
      if (currentActiveButton && currentActiveButton !== button) {
        switchTab(currentActiveButton, button, indicator);
      }
    });
  });

  tabButtonsWrapper.addEventListener('keydown', (event) => {
    const currentButton = event.target;
    if (!currentButton.classList.contains(config.tabButtonClass)) {
      return;
    }
    handleKeyboardNavigation(event, currentButton, allButtons, indicator);
  });

  tailsContainer.append(tabList, tabPanelsContainer);

  block.textContent = '';
  block.appendChild(tailsContainer);

  requestAnimationFrame(() => {
    const activeButton = tabButtonsWrapper.querySelector(
      `.${config.tabButtonClass}.${config.activeClass}`,
    );
    if (activeButton) {
      updateIndicator(indicator, activeButton);
    }
  });
}
