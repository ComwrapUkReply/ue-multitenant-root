/**
 * Module for handling component locking and user-specific filtering
 */

/**
 * Fetches current user and their group memberships
 * @returns {Promise<Object>} User data including group memberships
 */
async function getCurrentUser() {
  try {
    const response = await fetch('/libs/granite/security/currentuser.json?props=memberOf');
    if (!response.ok) throw new Error('Failed to fetch user data');
    return await response.json();
  } catch (error) {
    // console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Removes authoring instrumentation from specified components
 * @param {HTMLElement} element - The component element to lock
 */
function lockComponent(element) {
  if (!element) return;

  // Remove all data-aue-* attributes
  const aueAttributes = Array.from(element.attributes)
    .filter((attr) => attr.name.startsWith('data-aue-'));

  aueAttributes.forEach((attr) => {
    element.removeAttribute(attr.name);
  });

  // Also remove from child elements
  element.querySelectorAll('[data-aue-resource]').forEach((child) => {
    lockComponent(child);
  });
}

/**
 * Updates component filters based on user group membership
 * @param {Object} userData - Current user data including group memberships
 * @returns {Promise<void>} A promise that resolves when the filter script is loaded
 */
async function updateComponentFilters(userData) {
  // console.log('Updating component filters for user:', userData);
  if (!userData?.memberOf) return;

  const userGroups = userData.memberOf;
  const filterScript = document.querySelector('script[type="application/vnd.adobe.aue.filter+json"]');
  if (!filterScript) {
    // console.error('Filter script element not found');
    return;
  }

  // Determine appropriate filter based on user groups
  let filterPath = '/content/aem-xwalk.resource/component-filters.json'; // default path
  // console.log('User groups:', userGroups);

  // Check if any group in the array has the name 'contributor'
  if (userGroups.some((group) => group.authorizableId === 'contributor')) {
    filterPath = '/content/aem-xwalk.resource/component-limited-filters.json';
  }

  // Set the filter path and ensure the script is loaded
  filterScript.setAttribute('src', filterPath);
  // Return a promise that resolves when the script is loaded
  // eslint-disable-next-line consistent-return
  return new Promise((resolve, reject) => {
    filterScript.onload = resolve;
    filterScript.onerror = reject;
  });
}

export { getCurrentUser, lockComponent, updateComponentFilters };
