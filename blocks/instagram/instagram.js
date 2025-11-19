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
 * Fetches Instagram embed HTML using oEmbed API
 * @param {string} url - Instagram post URL
 * @returns {Promise<string>} - Instagram embed HTML
 */
async function getInstagramEmbed(url) {
  try {
    // Use Instagram's oEmbed API endpoint
    const oembedUrl = `https://graph.instagram.com/oembed?url=${encodeURIComponent(url)}&omitscript=true`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch Instagram embed: ${response.status}`);
    }

    const data = await response.json();
    return data.html;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching Instagram embed:', error);
    // Return a fallback link
    return `<div class="instagram-error">
      <p>Unable to load Instagram post.</p>
      <a href="${url}" target="_blank" rel="noopener noreferrer">View on Instagram</a>
    </div>`;
  }
}

/**
 * Loads Instagram embed script if not already loaded
 */
function loadInstagramScript() {
  if (!document.querySelector('script[src="https://www.instagram.com/embed.js"]')) {
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  } else if (window.instgrm) {
    // If script already loaded, process embeds
    window.instgrm.Embeds.process();
  }
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

  // Show loading state
  block.innerHTML = '<div class="instagram-loading">Loading Instagram post...</div>';

  try {
    // Fetch the embed HTML from Instagram's oEmbed API
    const embedHtml = await getInstagramEmbed(url);

    // Clear the block and insert the embed HTML
    block.innerHTML = embedHtml;

    // Load Instagram's embed script to make it interactive
    loadInstagramScript();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating Instagram block:', error);
    block.innerHTML = `<div class="instagram-error">
      <p>Unable to load Instagram post.</p>
      <a href="${url}" target="_blank" rel="noopener noreferrer">View on Instagram</a>
    </div>`;
  }
}
