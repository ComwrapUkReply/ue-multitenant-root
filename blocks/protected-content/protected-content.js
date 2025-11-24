/**
 * Protected Content block implementation
 * Shows/hides content based on user's access level
 */

import { getUserData, hasAccessLevel } from '../../scripts/auth-utils.js';

/**
 * Get required access level from block
 * @param {HTMLElement} block - The block DOM element
 * @returns {string} Required access level
 */
const getRequiredLevel = (block) => {
  // Check data attribute first
  if (block.dataset.accessLevel) {
    return block.dataset.accessLevel;
  }

  // Look for level in class names (e.g., "protected-content-premium")
  const blockClasses = [...block.classList];
  const levelClass = blockClasses.find((cls) => cls.startsWith('protected-content-'));

  if (levelClass) {
    const level = levelClass.replace('protected-content-', '');
    if (['member', 'premium', 'admin'].includes(level)) {
      return level;
    }
  }

  // Default to member level
  return 'member';
};

/**
 * Create access indicator element
 * @param {string} requiredLevel - Required access level
 * @returns {HTMLElement} Access indicator element
 */
const createAccessIndicator = (requiredLevel) => {
  const indicator = document.createElement('div');
  indicator.className = 'access-indicator';
  indicator.textContent = `✓ ${requiredLevel} content`;
  return indicator;
};

/**
 * Create upgrade message for logged in users
 * @param {Object} userData - User data object
 * @param {string} requiredLevel - Required access level
 * @returns {HTMLElement} Upgrade message element
 */
const createUpgradeMessage = (userData, requiredLevel) => {
  const upgradeMessage = document.createElement('div');
  upgradeMessage.className = 'upgrade-message';

  upgradeMessage.innerHTML = `
    <div class="lock-icon">🔒</div>
    <h3>Premium Content</h3>
    <p>This content requires <strong>${requiredLevel}</strong> access.</p>
    <p>Your current level: <strong>${userData.level}</strong></p>
    <a href="/upgrade" class="upgrade-button">Upgrade Now</a>
  `;

  return upgradeMessage;
};

/**
 * Create login message for unauthenticated users
 * @returns {HTMLElement} Login message element
 */
const createLoginMessage = () => {
  const loginMessage = document.createElement('div');
  loginMessage.className = 'upgrade-message';

  const returnUrl = encodeURIComponent(window.location.pathname);

  loginMessage.innerHTML = `
    <div class="lock-icon">🔒</div>
    <h3>Sign In Required</h3>
    <p>Please sign in to access this content.</p>
    <a href="/login?returnUrl=${returnUrl}" class="login-button">Sign In</a>
  `;

  return loginMessage;
};

/**
 * Decorate protected content block
 * @param {HTMLElement} block - The block DOM element
 */
export default function decorate(block) {
  const requiredLevel = getRequiredLevel(block);
  const userData = getUserData();
  const hasAccess = hasAccessLevel(requiredLevel);

  if (hasAccess) {
    // User has access - show content with indicator
    block.classList.add('has-access');

    const indicator = createAccessIndicator(requiredLevel);
    block.prepend(indicator);
  } else {
    // User doesn't have access - show appropriate message
    block.classList.add('no-access');

    // Clear block content
    block.innerHTML = '';

    // Add appropriate message
    const message = userData
      ? createUpgradeMessage(userData, requiredLevel)
      : createLoginMessage();

    block.appendChild(message);
  }
}

