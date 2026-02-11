import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Configuration constants for tabs block
 */
const config = {
  activeClass: 'active',
  tabButtonClass: 'tabs-tab-button',
  tabPanelClass: 'tabs-tab-panel',
  // Semantic classes for panel content (cards-like nesting: image, title, content)
  panelImageClass: 'tabs-tab-image',
  panelTitleClass: 'tabs-tab-title',
  panelContentClass: 'tabs-tab-content',
};

/**
 * Generates a unique ID for tab panels and buttons
 * @returns {string} Unique identifier
 */
const generateUniqueId = () => `tab-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Extracts tab data from the block structure (cards-like: each row = one tab, cells = fields).
 * Supports 2 cells (title, content) or 3 cells (image, title, content) per row.
 * @param {Element} block - The block element
 * @returns {Array<{ row: Element, titleText: string }>} Array of tab objects with row and title text for button
 */
const extractTabsData = (block) => {
  const rows = [...block.children];

  return rows.reduce((tabs, row) => {
    const cells = [...row.children];

    if (cells.length >= 2) {
      // Title is first text cell: index 0 for 2-cell (title, content), index 1 for 3-cell (image, title, content)
      const titleCell = cells.length >= 3 ? cells[1] : cells[0];
      const titleText = titleCell ? titleCell.textContent.trim() : '';
      tabs.push({ row, titleText });
    }

    return tabs;
  }, []);
};

/**
 * Creates the tab list structure with indicator
 * @returns {Object} Tab list elements
 */
const createTabList = () => {
  const tabList = document.createElement('div');
  tabList.className = 'tabs-tab-list';
  tabList.setAttribute('role', 'tablist');
  tabList.setAttribute('aria-label', 'Content tabs');

  const indicator = document.createElement('div');
  indicator.className = 'tabs-indicator';
  indicator.setAttribute('aria-hidden', 'true');

  const tabButtonsWrapper = document.createElement('div');
  tabButtonsWrapper.className = 'tabs-tab-buttons-wrapper';

  tabList.append(indicator, tabButtonsWrapper);

  return { tabList, indicator, tabButtonsWrapper };
};

/**
 * Creates a tab button element
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
  buttonContent.className = 'tabs-tab-button-content';
  buttonContent.textContent = title;
  button.appendChild(buttonContent);

  if (isActive) {
    button.classList.add(config.activeClass);
  }

  moveInstrumentation(row, button);

  return button;
};

/**
 * Creates a tab panel by moving row children into the panel and assigning semantic classes
 * (cards-like: preserve DOM, add tabs-tab-image / tabs-tab-title / tabs-tab-content).
 * Supports 2 cells (title, content) or 3 cells (image, title, content).
 * @param {Element} row - Row element whose children will be moved into the panel
 * @param {string} uniqueId - Unique identifier for the tab
 * @param {boolean} isActive - Whether this panel is active
 * @returns {Element} Tab panel element
 */
const createTabPanel = (row, uniqueId, isActive) => {
  const panel = document.createElement('div');
  panel.className = config.tabPanelClass;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('id', uniqueId);
  panel.setAttribute('aria-labelledby', `${uniqueId}-button`);

  // Move row children into panel (same pattern as cards: move nodes, don't use innerHTML)
  while (row.firstElementChild) {
    panel.appendChild(row.firstElementChild);
  }

  // Assign semantic classes by order: 3 cells = image, title, content; 2 cells = title, content
  const children = [...panel.children];
  if (children.length >= 3) {
    children[0].classList.add(config.panelImageClass);
    children[1].classList.add(config.panelTitleClass);
    children[2].classList.add(config.panelContentClass);
  } else if (children.length === 2) {
    children[0].classList.add(config.panelTitleClass);
    children[1].classList.add(config.panelContentClass);
  }

  moveInstrumentation(row, panel);

  if (!isActive) {
    panel.setAttribute('hidden', '');
  } else {
    panel.classList.add(config.activeClass);
  }

  return panel;
};

/**
 * Updates the indicator position
 * @param {Element} indicator - Indicator element
 * @param {Element} activeButton - Active button element
 */
const updateIndicator = (indicator, activeButton) => {
  const { offsetTop: top, offsetHeight: height } = activeButton;
  indicator.style.top = `${top}px`;
  indicator.style.height = `${height}px`;
};

/**
 * Switches between tabs
 * @param {Element} fromButton - Current active button
 * @param {Element} toButton - Button to activate
 * @param {Element} indicator - Indicator element
 */
const switchTab = (fromButton, toButton, indicator) => {
  const fromPanel = document.getElementById(fromButton.getAttribute('aria-controls'));
  const toPanel = document.getElementById(toButton.getAttribute('aria-controls'));

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

  // Update indicator
  updateIndicator(indicator, toButton);
};

/**
 * Handles keyboard navigation
 * @param {KeyboardEvent} event - Keyboard event
 * @param {Element} currentButton - Current focused button
 * @param {Array<Element>} buttons - All tab buttons
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

  // Handle Enter/Space for explicit activation
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    currentButton.click();
    return;
  }

  if (keyActions[event.key]) {
    event.preventDefault();
    nextIndex = keyActions[event.key]();
    switchTab(currentButton, buttons[nextIndex], indicator);
  }
};

/**
 * Decorates the tabs block
 * @param {Element} block - The block element
 */
export default async function decorate(block) {
  // Extract tabs data from block structure
  const tabsData = extractTabsData(block);

  if (tabsData.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('Tabs block: No tabs found');
    return;
  }

  // Create tabs container structure
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'tabs-block';

  // Create tab list with indicator and buttons wrapper
  const { tabList, indicator, tabButtonsWrapper } = createTabList();

  // Create tab panels container (content area on the right)
  const tabPanelsContainer = document.createElement('div');
  tabPanelsContainer.className = 'tabs-tab-panels';

  // Create tabs from extracted data (titleText for button, row moved into panel)
  const tabs = tabsData.map((tabData, index) => {
    const uniqueId = generateUniqueId();
    const { titleText, row } = tabData;
    const isActive = index === 0;

    const button = createTabButton(titleText, uniqueId, isActive, row);
    const panel = createTabPanel(row, uniqueId, isActive);

    return { button, panel };
  });

  // Add buttons and panels to their containers
  tabs.forEach(({ button, panel }) => {
    tabButtonsWrapper.appendChild(button);
    tabPanelsContainer.appendChild(panel);
  });

  // Ensure first tab button is active by default on initial render
  // This defensively enforces the active state in case upstream markup changes.
  const firstTabButton = tabButtonsWrapper.querySelector(`.${config.tabButtonClass}`);
  if (firstTabButton && !firstTabButton.classList.contains(config.activeClass)) {
    firstTabButton.classList.add(config.activeClass);
    firstTabButton.setAttribute('aria-selected', 'true');
  }

  // Get all tab buttons for event handling
  const allButtons = [...tabButtonsWrapper.querySelectorAll(`.${config.tabButtonClass}`)];

  // Add click event listeners to tab buttons
  tabs.forEach(({ button }) => {
    button.addEventListener('click', () => {
      const currentActiveButton = tabButtonsWrapper.querySelector(`.${config.tabButtonClass}.${config.activeClass}`);
      if (currentActiveButton !== button) {
        switchTab(currentActiveButton, button, indicator);
      }
    });
  });

  // Keyboard navigation
  tabButtonsWrapper.addEventListener('keydown', (event) => {
    const currentButton = event.target;
    if (!currentButton.classList.contains(config.tabButtonClass)) {
      return;
    }

    handleKeyboardNavigation(event, currentButton, allButtons, indicator);
  });

  // Assemble the tabs structure
  tabsContainer.append(tabList, tabPanelsContainer);

  // Replace block content
  block.textContent = '';
  block.appendChild(tabsContainer);

  // Position indicator after render
  requestAnimationFrame(() => {
    const activeButton = tabButtonsWrapper.querySelector(`.${config.tabButtonClass}.${config.activeClass}`);
    if (activeButton) {
      updateIndicator(indicator, activeButton);
    }
  });
}
