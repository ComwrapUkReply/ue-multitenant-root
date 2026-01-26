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
    'jpg', 'jpeg', 'heic', 'png', 'webp', 'bmp',
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

export default function decorate(block) {
  const rows = block.children || [];
  let downloadLink;

  if (rows[3]) {
    const img = rows[3].querySelector('img');
    const anchor = rows[3].querySelector('a');
    downloadLink = img?.src || anchor?.href;
  }

  // Validate file type when block loads
  const isValidFile = downloadLink ? isValidFileType(downloadLink) : true;
  const fileExtension = downloadLink
    ? downloadLink.split('?')[0].split('.').pop()?.toLowerCase()
    : null;

  const downloadData = {
    title: rows[0]?.textContent,
    description: rows[1]?.innerHTML,
    buttonLabel: rows[2]?.textContent,
    downloadLink,
    showPreviewImage: rows[4]?.textContent?.trim() === 'true',
    previewImage: rows[5]?.textContent?.trim(),
    color: rows[6]?.textContent?.trim(),
    width: rows[7]?.textContent?.trim(),
    hasButton: rows[8]?.textContent?.trim() === 'true',
    isValidFile,
    fileExtension,
  };
  // return;
  // Clear existing content
  block.innerHTML = '';

  // Set block class and optional color variant after clearing
  block.className = 'download-wrapper-inner';
  const colorClassMap = {
    grey: 'color-grey',
    'light blue': 'color-light-blue',
    'dark blue': 'color-dark-blue',
    white: 'color-white',
  };
  const colorClass = colorClassMap[downloadData.color?.toLowerCase?.()] || '';
  if (colorClass) block.classList.add(colorClass);

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

  // Create title
  if (downloadData.title) {
    const title = document.createElement('h2');
    title.className = 'download-title';
    title.textContent = downloadData.title;
    contentWrapper.appendChild(title);
  }

  // Create description
  if (downloadData.description) {
    const description = document.createElement('div');
    description.className = 'download-description';
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

    contentWrapper.appendChild(button);
  }
  // Note: For invalid file types, no download button is created at all
  // This ensures the file cannot be accessed without modifying JavaScript
}
