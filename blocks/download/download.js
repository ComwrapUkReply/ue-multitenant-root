/**
 * Configuration for the download block
 */
const CONFIG = {
  // Allowed file extensions based on requirements
  allowedExtensions: [
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'xml',
    // Images
    'jpg', 'jpeg', 'heic', 'png', 'webp', 'bmp',
    // Videos
    'avs', 'acv', 'avc', 'ev', 'mp4',
    // Archives
    'zip',
    // Media
    'mp3', 'mov',
  ],
  // File extensions that support thumbnail preview
  previewableExtensions: [
    // Images - can be displayed directly
    'jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif',
    // Documents - AEM/Dynamic Media can generate thumbnails
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    // Videos - can show poster frame
    'mp4', 'mov',
  ],
  // Color class mapping for card variants
  colorClassMap: {
    grey: 'color-grey',
    'light blue': 'color-light-blue',
    'dark blue': 'color-dark-blue',
    white: 'color-white',
  },
  // Thumbnail rendition parameters for Dynamic Media
  thumbnailParams: {
    width: 400,
    height: 300,
    format: 'webp',
  },
};

/**
 * CSS selectors used in the block
 */
const SELECTORS = {
  img: 'img',
  anchor: 'a',
  picture: 'picture',
};

/**
 * CSS classes used in the block
 */
const CLASSES = {
  wrapperInner: 'download-wrapper-inner',
  hasButton: 'has-button',
  noButton: 'no-button',
  invalidFileType: 'invalid-file-type',
  widthHalf: 'width-half',
  hasPreviewImage: 'has-preview-image',
  content: 'download-content',
  title: 'download-title',
  description: 'download-description',
  fileInfo: 'download-file-info',
  button: 'download-button',
  icon: 'download-icon',
  warning: 'download-warning',
  previewImageWrapper: 'download-preview-image-wrapper',
  previewImage: 'download-preview-image',
  previewFallback: 'download-preview-fallback',
};

/**
 * Validates if a file extension is in the allowed list
 * @param {string} fileUrl - The file URL or path
 * @returns {boolean} - True if file type is allowed
 */
function isValidFileType(fileUrl) {
  if (!fileUrl) return false;

  // Extract file extension from URL
  const urlPath = fileUrl.split('?')[0]; // Remove query parameters
  const extension = urlPath.split('.').pop()?.toLowerCase();

  return extension && CONFIG.allowedExtensions.includes(extension);
}

/**
 * Checks if a file type supports preview thumbnails
 * @param {string} extension - The file extension
 * @returns {boolean} - True if file type supports preview
 */
function isPreviewableFileType(extension) {
  if (!extension) return false;
  return CONFIG.previewableExtensions.includes(extension.toLowerCase());
}

/**
 * Generates a thumbnail URL from the asset URL using Dynamic Media renditions
 * For AEM assets, this creates a web-optimized thumbnail
 * @param {string} assetUrl - The original asset URL
 * @param {string} extension - The file extension
 * @returns {string} - The thumbnail URL
 */
function generateThumbnailUrl(assetUrl, extension) {
  if (!assetUrl) return null;

  const lowerExt = extension?.toLowerCase();

  // For image files, use the asset directly with width parameter for optimization
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'];
  if (imageExtensions.includes(lowerExt)) {
    // Check if it's an AEM/Dynamic Media URL
    if (assetUrl.includes('/content/dam/') || assetUrl.includes('.scene7.com')) {
      // Add Dynamic Media image serving parameters for thumbnail
      const separator = assetUrl.includes('?') ? '&' : '?';
      return `${assetUrl}${separator}width=${CONFIG.thumbnailParams.width}&quality=80`;
    }
    // For other image URLs, return as-is
    return assetUrl;
  }

  // For PDFs and documents in AEM DAM, use the thumbnail rendition
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  if (documentExtensions.includes(lowerExt)) {
    // Check if it's an AEM DAM URL
    if (assetUrl.includes('/content/dam/')) {
      // AEM generates thumbnails for documents at cq5dam.thumbnail.* path
      // Extract the base path and construct thumbnail URL
      const basePath = assetUrl.split('?')[0];
      // Use the web rendition or thumbnail
      return `${basePath}/jcr:content/renditions/cq5dam.web.1280.1280.jpeg`;
    }
  }

  // For videos, try to get a poster frame
  const videoExtensions = ['mp4', 'mov'];
  if (videoExtensions.includes(lowerExt)) {
    if (assetUrl.includes('/content/dam/')) {
      const basePath = assetUrl.split('?')[0];
      return `${basePath}/jcr:content/renditions/cq5dam.video.fullhd.mp4.thumbnail.jpg`;
    }
  }

  return null;
}

/**
 * Creates and displays a simple warning message for invalid file types
 * @param {HTMLElement} container - Container element to append warning to
 * @returns {HTMLElement} - The warning message element
 */
function createWarningMessage(container) {
  const warningMsg = document.createElement('div');
  warningMsg.className = CLASSES.warning;
  warningMsg.setAttribute('role', 'alert');
  warningMsg.setAttribute('aria-live', 'polite');
  warningMsg.textContent = 'Invalid file type';
  container.appendChild(warningMsg);
  return warningMsg;
}

/**
 * Creates a fallback icon element for files without preview
 * @param {string} extension - The file extension
 * @returns {HTMLElement} - The fallback icon element
 */
function createFallbackIcon(extension) {
  const fallback = document.createElement('div');
  fallback.className = CLASSES.previewFallback;

  // Create file type icon based on extension
  const iconText = document.createElement('span');
  iconText.className = 'download-preview-fallback-ext';
  iconText.textContent = extension?.toUpperCase() || 'FILE';

  // Create file icon SVG
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('width', '48');
  svg.setAttribute('height', '48');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.5');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('download-preview-fallback-icon');

  // File icon path
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z');
  svg.appendChild(path);

  const polyline = document.createElementNS(svgNS, 'polyline');
  polyline.setAttribute('points', '14 2 14 8 20 8');
  svg.appendChild(polyline);

  fallback.appendChild(svg);
  fallback.appendChild(iconText);

  return fallback;
}

/**
 * Creates the preview image element with proper structure
 * @param {string} thumbnailUrl - The thumbnail URL
 * @param {string} altText - Alt text for the image
 * @param {string} extension - File extension for fallback
 * @returns {HTMLElement} - The preview image wrapper element
 */
function createPreviewImageElement(thumbnailUrl, altText, extension) {
  const imageWrapper = document.createElement('div');
  imageWrapper.className = CLASSES.previewImageWrapper;

  if (thumbnailUrl) {
    // Create picture element for responsive images
    const picture = document.createElement('picture');

    // Create the img element
    const img = document.createElement('img');
    img.className = CLASSES.previewImage;
    img.src = thumbnailUrl;
    img.alt = altText || 'Download preview';
    img.loading = 'lazy';
    img.decoding = 'async';

    // Handle image load error - show fallback
    img.addEventListener('error', () => {
      picture.remove();
      imageWrapper.appendChild(createFallbackIcon(extension));
    });

    picture.appendChild(img);
    imageWrapper.appendChild(picture);
  } else {
    // No thumbnail URL available, show fallback icon
    imageWrapper.appendChild(createFallbackIcon(extension));
  }

  return imageWrapper;
}

export default function decorate(block) {
  const rows = block.children || [];
  let downloadLink;

  // Extract download link from row 3 (downloadfile field)
  if (rows[3]) {
    const img = rows[3].querySelector(SELECTORS.img);
    const anchor = rows[3].querySelector(SELECTORS.anchor);
    downloadLink = img?.src || anchor?.href;
  }

  // Validate file type when block loads
  const isValidFile = downloadLink ? isValidFileType(downloadLink) : true;
  const fileExtension = downloadLink
    ? downloadLink.split('?')[0].split('.').pop()?.toLowerCase()
    : null;

  // Build download data object from block rows
  // Row order: title(0), description(1), buttonLabel(2), downloadfile(3),
  //            showPreview(4), color(5), width(6), hasButton(7)
  const downloadData = {
    title: rows[0]?.textContent?.trim(),
    description: rows[1]?.innerHTML,
    buttonLabel: rows[2]?.textContent?.trim(),
    downloadLink,
    showPreview: rows[4]?.textContent?.trim() === 'true',
    color: rows[5]?.textContent?.trim(),
    width: rows[6]?.textContent?.trim(),
    hasButton: rows[7]?.textContent?.trim() === 'true',
    isValidFile,
    fileExtension,
  };

  // Clear existing content
  block.innerHTML = '';

  // Set block class and optional color variant after clearing
  block.className = CLASSES.wrapperInner;
  const colorClass = CONFIG.colorClassMap[downloadData.color?.toLowerCase?.()] || '';
  if (colorClass) block.classList.add(colorClass);

  // Add class based on whether there's a button
  if (downloadData.hasButton) {
    block.classList.add(CLASSES.hasButton);
  } else {
    block.classList.add(CLASSES.noButton);
    // Make the whole card clickable if there's no button (only if file type is valid)
    if (downloadData.downloadLink && downloadData.isValidFile) {
      block.style.cursor = 'pointer';
      block.addEventListener('click', () => {
        window.location.href = downloadData.downloadLink;
      });
    } else if (downloadData.downloadLink && !downloadData.isValidFile) {
      // Disable click for invalid file types
      block.style.cursor = 'not-allowed';
      block.style.opacity = '0.6';
    }
  }

  // Add invalid file class for styling
  if (!downloadData.isValidFile) {
    block.classList.add(CLASSES.invalidFileType);
  }

  // Add width class (half-width only applies on desktop via CSS)
  if (downloadData.width === 'half-width') {
    block.classList.add(CLASSES.widthHalf);
  }

  // Create preview image from download file if enabled
  if (downloadData.showPreview && downloadData.downloadLink) {
    block.classList.add(CLASSES.hasPreviewImage);

    // Generate thumbnail URL from the download file
    const thumbnailUrl = generateThumbnailUrl(downloadData.downloadLink, downloadData.fileExtension);
    const previewImageElement = createPreviewImageElement(
      thumbnailUrl,
      downloadData.title || 'Download preview',
      downloadData.fileExtension,
    );
    block.appendChild(previewImageElement);
  }

  // Create content wrapper for visible content
  const contentWrapper = document.createElement('div');
  contentWrapper.className = CLASSES.content;

  // Create title
  if (downloadData.title) {
    const title = document.createElement('h2');
    title.className = CLASSES.title;
    title.textContent = downloadData.title;
    contentWrapper.appendChild(title);
  }

  // Create description
  if (downloadData.description) {
    const description = document.createElement('div');
    description.className = CLASSES.description;
    description.innerHTML = downloadData.description;
    contentWrapper.appendChild(description);
  }

  // Show warning message for invalid file types
  if (downloadData.downloadLink && !downloadData.isValidFile) {
    createWarningMessage(contentWrapper);
  }

  // Append content wrapper to block
  block.appendChild(contentWrapper);

  // Create file info section
  if (downloadData.downloadLink) {
    const fileInfo = document.createElement('div');
    fileInfo.className = CLASSES.fileInfo;
  }

  // Create download button (only if file type is valid)
  if (
    downloadData.downloadLink
    && downloadData.isValidFile
    && downloadData.buttonLabel
    && downloadData.hasButton
  ) {
    const button = document.createElement('a');
    button.className = CLASSES.button;
    button.href = downloadData.downloadLink;
    button.setAttribute('download', '');
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', `Download ${downloadData.buttonLabel}`);
    button.setAttribute('title', `Download ${downloadData.buttonLabel}`);
    const buttonText = document.createElement('span');
    buttonText.textContent = downloadData.buttonLabel;
    button.appendChild(buttonText);

    // Inline SVG so it can inherit `currentColor` (per-card button/icon colors)
    const svgNS = 'http://www.w3.org/2000/svg';
    const buttonIcon = document.createElementNS(svgNS, 'svg');
    buttonIcon.setAttribute('xmlns', svgNS);
    buttonIcon.setAttribute('width', '24');
    buttonIcon.setAttribute('height', '24');
    buttonIcon.setAttribute('viewBox', '0 0 24 24');
    buttonIcon.setAttribute('fill', 'none');
    buttonIcon.setAttribute('stroke', 'currentColor');
    buttonIcon.setAttribute('stroke-width', '2');
    buttonIcon.setAttribute('stroke-linecap', 'round');
    buttonIcon.setAttribute('stroke-linejoin', 'round');
    buttonIcon.setAttribute('aria-hidden', 'true');
    buttonIcon.setAttribute('focusable', 'false');
    buttonIcon.classList.add(CLASSES.icon);

    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', '12');
    line.setAttribute('y1', '19');
    line.setAttribute('x2', '12');
    line.setAttribute('y2', '5');
    buttonIcon.appendChild(line);

    const polyline = document.createElementNS(svgNS, 'polyline');
    polyline.setAttribute('points', '5 12 12 5 19 12');
    buttonIcon.appendChild(polyline);

    button.appendChild(buttonIcon);

    contentWrapper.appendChild(button);
  }
  // Note: For invalid file types, no download button is created at all
  // This ensures the file cannot be accessed without modifying JavaScript
}
