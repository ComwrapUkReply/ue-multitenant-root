/**
 * Creates and manages the back to top button
 */
function createBackToTopButton() {
  // Create the button element
  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.setAttribute('aria-label', 'Back to top');
  button.setAttribute('title', 'Back to top');

  // Add the up arrow icon
  const icon = document.createElement('img');
  icon.src = `${window.hlx.codeBasePath}/icons/arrow-up.svg`;
  icon.alt = 'Back to top';
  icon.style.filter = 'brightness(0) invert(1)'; // Makes the SVG white
  icon.style.width = '24px';
  icon.style.height = '24px';
  button.appendChild(icon);

  // Add click event listener
  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });

  // Add keyboard support
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  });

  // Append to body
  document.body.appendChild(button);

  // Show/hide button based on scroll position
  const toggleButtonVisibility = () => {
    const scrollThreshold = 300; // Show button after scrolling 300px

    if (window.scrollY > scrollThreshold) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  };

  // Initial check
  toggleButtonVisibility();

  // Listen to scroll events with throttling for better performance
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }

    scrollTimeout = window.requestAnimationFrame(() => {
      toggleButtonVisibility();
    });
  }, { passive: true });
}

/**
 * Returns true if the given URL hostname should be treated as internal (same site).
 * Covers the current origin and all *.aem.page / *.aem.live variants of the same project.
 */
function isInternalHostname(hostname, currentHostname) {
  if (hostname === currentHostname) return true;
  if (hostname.endsWith('.aem.page') || hostname.endsWith('.aem.live')) return true;
  return false;
}

/**
 * Applies target="_blank" and rel="noopener noreferrer" to a single anchor
 * if its href points to an external hostname.
 */
function processExternalLink(anchor) {
  const { origin, hostname } = window.location;
  const href = anchor.getAttribute('href');

  if (!href) return;

  try {
    const url = new URL(href, origin);
    if (!isInternalHostname(url.hostname, hostname)) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  } catch {
    // Malformed href — skip silently
  }
}

/**
 * Opens external links in a new tab.
 * Processes all existing anchors and watches for dynamically added ones
 * (e.g. lazy-loaded blocks, modals) via a MutationObserver.
 */
function openExternalLinksInNewTab() {
  document.querySelectorAll('a[href]').forEach(processExternalLink);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches('a[href]')) {
          processExternalLink(node);
        }
        node.querySelectorAll('a[href]').forEach(processExternalLink);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Initialize back to top button
createBackToTopButton();

// Open external links in a new tab
openExternalLinksInNewTab();
