/**
 * Access Badge block implementation
 * Displays user's current access level
 */

import { getUserData } from '../../scripts/auth-utils.js';

/**
 * Access level configuration with icons and labels
 */
const LEVEL_CONFIG = {
  member: {
    icon: '⭐',
    label: 'Member',
    class: 'member',
  },
  premium: {
    icon: '💎',
    label: 'Premium',
    class: 'premium',
  },
  admin: {
    icon: '👑',
    label: 'Admin',
    class: 'admin',
  },
};

/**
 * Create guest badge HTML
 * @returns {string} Guest badge HTML
 */
const createGuestBadge = () => `
  <div class="access-badge guest">
    <span class="badge-icon">👤</span>
    <span class="badge-text">Guest</span>
  </div>
`;

/**
 * Create user badge HTML
 * @param {Object} userData - User data object
 * @param {Object} config - Level configuration
 * @returns {string} User badge HTML
 */
const createUserBadge = (userData, config) => `
  <div class="access-badge ${config.class}">
    <span class="badge-icon">${config.icon}</span>
    <div class="badge-content">
      <span class="badge-label">${config.label}</span>
      <span class="badge-name">${userData.userName}</span>
    </div>
  </div>
`;

/**
 * Decorate access badge block
 * @param {HTMLElement} block - The block DOM element
 */
export default function decorate(block) {
  const userData = getUserData();

  if (!userData) {
    // Not logged in - show guest badge
    block.innerHTML = createGuestBadge();
    return;
  }

  // Get level configuration
  const config = LEVEL_CONFIG[userData.level] || LEVEL_CONFIG.member;

  // Show user badge
  block.innerHTML = createUserBadge(userData, config);
}

