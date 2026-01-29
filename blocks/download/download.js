/**
 * Validates if a file extension is in the allowed list
 * @param {string} fileUrl - The file URL or path
 * @returns {boolean} - True if file type is allowed
 */
function isValidFileType(fileUrl) {
  if (!fileUrl) return false;

  // Allowed file extensions based on requirements
  const allowedExtensions = [
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'xml',
    // Images
    'jpg', 'jpeg', 'heic', 'png', 'webp', 'bmp', 'svg', 'gif',
    // Videos
    'avs', 'acv', 'avc', 'ev', 'mp4',
    // Archives
    'zip',
    // Media
    'mp3', 'mov',
  ];

  // Extract file extension from URL
  const urlPath = fileUrl.split('?')[0]; // Remove query parameters
  const extension = urlPath.split('.').pop()?.toLowerCase();

  return extension && allowedExtensions.includes(extension);
}

/**
 * Creates and displays a simple warning message for invalid file types
 * @param {HTMLElement} container - Container element to append warning to
 * @returns {HTMLElement} - The warning message element
 */
function createWarningMessage(container) {
  const warningMsg = document.createElement('div');
  warningMsg.className = 'download-warning';
  warningMsg.setAttribute('role', 'alert');
  warningMsg.setAttribute('aria-live', 'polite');
  warningMsg.textContent = 'Invalid file type';
  container.appendChild(warningMsg);
  return warningMsg;
}

/**
 * When Universal Editor updates this block, it inserts a new block then removes the old one.
 * If the old block is not removed (e.g. due to an exception), we end up with two blocks
 * in the same download-wrapper. Remove any sibling that has the same data-aue-resource
 * so only this (the new) block remains.
 * @param {HTMLElement} block - This block element
 */
function removeDuplicateBlockInWrapper(block) {
  const resource = block.getAttribute('data-aue-resource');
  if (!resource) return;

  const parent = block.parentElement;
  if (!parent || !parent.classList.contains('download-wrapper')) return;

  const siblings = [...parent.children].filter(
    (el) => el !== block && el.classList.contains('block') && el.getAttribute('data-aue-resource') === resource,
  );
  siblings.forEach((duplicate) => duplicate.remove());
}

export default function decorate(block) {
  // Remove any duplicate (old) block left in the same wrapper before decorating
  removeDuplicateBlockInWrapper(block);

  const rows = block.children || [];
  let downloadLink;
  let downloadImage;
  let previewImage;

  if (rows[2]) {
    downloadImage = rows[2].querySelector('img');
    const anchor = rows[2].querySelector('a');
    downloadLink = anchor?.href || downloadImage?.src;
  }

  if (rows[4]) {
    const img = rows[4].querySelector('img');
    previewImage = img?.src;
    if (!previewImage && downloadImage) {
      previewImage = downloadImage?.src;
    }
  }

  // Validate file type when block loads
  const isValidFile = downloadLink ? isValidFileType(downloadLink) : true;
  const fileExtension = downloadLink
    ? downloadLink.split('?')[0].split('.').pop()?.toLowerCase()
    : null;

  const downloadData = {
    title: rows[0]?.textContent ? `${rows[0]?.textContent} (${fileExtension?.toUpperCase()})` : '',
    description: rows[1]?.innerHTML,
    downloadLink,
    showPreviewImage: rows[3]?.textContent?.trim() === 'true',
    previewImage,
    style: rows[5]?.textContent?.trim(),
    width: rows[6]?.textContent?.trim(),
    hasButton: rows[7]?.textContent?.trim() === 'true',
    buttonLabel: rows[8]?.textContent,
    isValidFile,
    fileExtension,
  };
  // Clear existing content
  block.innerHTML = '';

  // Preserve block identification classes (block, download) and add wrapper class
  // Universal Editor needs these classes to identify and update the block
  block.classList.add('download-wrapper-inner');
  const styleClassMap = {
    solid: 'style-solid',
    outline: 'style-outline',
  };
  const styleClass = styleClassMap[downloadData.style?.toLowerCase?.()] || 'style-outline';
  block.classList.add(styleClass);

  // Add class based on whether there's a button
  if (downloadData.hasButton) {
    block.classList.add('has-button');
  } else {
    block.classList.add('no-button');
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
    block.classList.add('invalid-file-type');
  }

  // Add width class (half-width only applies on desktop via CSS)
  if (downloadData.width === 'half-width') {
    block.classList.add('width-half');
  }

  // Create content wrapper for visible content
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'download-content';

  // Create content wrapper for text content
  const textWrapper = document.createElement('div');
  textWrapper.className = 'download-content-wrapper';

  // Create title
  if (downloadData.title) {
    const title = document.createElement('h2');
    title.className = 'download-title';
    title.textContent = downloadData.title;
    textWrapper.appendChild(title);
  }

  // Create description
  if (downloadData.description) {
    const description = document.createElement('div');
    description.className = 'download-description';
    description.innerHTML = downloadData.description;
    textWrapper.appendChild(description);
  }

  // Append text wrapper to content wrapper
  contentWrapper.appendChild(textWrapper);

  // Create preview image (will be positioned on the right via CSS)
  if (downloadData.showPreviewImage && downloadData.previewImage) {
    const previewImageElement = document.createElement('img');
    previewImageElement.className = 'download-preview-image';
    previewImageElement.src = downloadData.previewImage;
    previewImageElement.alt = downloadData.title || 'Download preview';
    contentWrapper.appendChild(previewImageElement);
  }

  // Show warning message for invalid file types
  if (downloadData.downloadLink && !downloadData.isValidFile) {
    createWarningMessage(textWrapper);
  }

  // Append content wrapper to block
  block.appendChild(contentWrapper);

  // Create file info section
  if (downloadData.downloadLink) {
    const fileInfo = document.createElement('div');
    fileInfo.className = 'download-file-info';
  }

  // Create download button (only if file type is valid)
  if (
    downloadData.downloadLink
    && downloadData.isValidFile
    && downloadData.buttonLabel
    && downloadData.hasButton
  ) {
    const button = document.createElement('a');
    button.className = 'download-button';
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
    buttonIcon.classList.add('download-icon');

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

    textWrapper.appendChild(button);
  }
  // Note: For invalid file types, no download button is created at all
  // This ensures the file cannot be accessed without modifying JavaScript
}
