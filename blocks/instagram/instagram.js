/**
 * Loads Instagram embed script if not already loaded
 */
function loadInstagramScript() {
  if (!window.instgrm) {
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
  } else {
    // If script already loaded, process embeds
    window.instgrm.Embeds.process();
  }
}

/**
 * Extracts Instagram post URL from various input formats
 * @param {string} url - Instagram URL or post ID
 * @returns {string} - Clean Instagram post URL
 */
function getInstagramUrl(url) {
  const cleanUrl = url.trim();

  // If it's already a full Instagram URL, return it
  if (cleanUrl.startsWith('https://www.instagram.com/') ||
      cleanUrl.startsWith('http://www.instagram.com/')) {
    return cleanUrl;
  }

  // If it's an instagram.com URL without protocol
  if (cleanUrl.startsWith('instagram.com/')) {
    return `https://www.${cleanUrl}`;
  }

  // If it's just a post ID or path (e.g., "p/ABC123/")
  if (cleanUrl.startsWith('p/')) {
    return `https://www.instagram.com/${cleanUrl}`;
  }

  // Return as-is and let Instagram's embed handle it
  return cleanUrl;
}

/**
 * Decorates Instagram embed blocks
 * @param {Element} block - The block element to decorate
 */
export default async function decorate(block) {
  // Get the URL from the block content
  const link = block.querySelector('a');

  if (!link) {
    block.textContent = 'No Instagram URL provided';
    return;
  }

  const url = getInstagramUrl(link.href);

  // Clear the block content
  block.textContent = '';

  // Create the Instagram embed blockquote structure
  const blockquote = document.createElement('blockquote');
  blockquote.className = 'instagram-media';
  blockquote.setAttribute('data-instgrm-permalink', url);
  blockquote.setAttribute('data-instgrm-version', '14');
  blockquote.style.background = '#FFF';
  blockquote.style.border = '0';
  blockquote.style.borderRadius = '3px';
  blockquote.style.boxShadow = '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)';
  blockquote.style.margin = '1px';
  blockquote.style.maxWidth = '540px';
  blockquote.style.minWidth = '326px';
  blockquote.style.padding = '0';
  blockquote.style.width = 'calc(100% - 2px)';

  // Add fallback link
  const fallbackLink = document.createElement('a');
  fallbackLink.href = url;
  fallbackLink.target = '_blank';
  fallbackLink.rel = 'noopener noreferrer';
  fallbackLink.textContent = 'View this post on Instagram';

  blockquote.appendChild(fallbackLink);
  block.appendChild(blockquote);

  // Load Instagram's embed script
  loadInstagramScript();
}
