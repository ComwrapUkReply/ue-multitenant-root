export default function decorate(block) {
  const rows = block.children || [];
  let downloadLink;

  if (rows[3]) {
    const img = rows[3].querySelector('img');
    const anchor = rows[3].querySelector('a');
    downloadLink = img?.src || anchor?.href;
  }
  const downloadData = {
    title: rows[0]?.textContent,
    description: rows[1]?.innerHTML,
    buttonLabel: rows[2]?.textContent,
    downloadLink,
    color: rows[4]?.textContent?.trim(),
    width: rows[5]?.textContent?.trim(),
    hasButton: rows[6]?.textContent?.trim() === 'true',
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
    // Make the whole card clickable if there's no button
    if (downloadData.downloadLink) {
      block.style.cursor = 'pointer';
      block.addEventListener('click', () => {
        window.location.href = downloadData.downloadLink;
      });
    }
  }

  block.style.width = downloadData.width === 'full-width' ? '100%' : '50%';

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

  // Append content wrapper to block
  block.appendChild(contentWrapper);

  // Create file info section
  if (downloadData.downloadLink) {
    const fileInfo = document.createElement('div');
    fileInfo.className = 'download-file-info';
  }

  // Create download button
  if (downloadData.downloadLink && downloadData.buttonLabel && downloadData.hasButton) {
    const button = document.createElement('a');
    button.className = 'download-button';
    button.href = downloadData.downloadLink;
    button.setAttribute('download', '');
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', `Download ${downloadData.buttonLabel}`);
    const buttonText = document.createElement('span');
    buttonText.textContent = downloadData.buttonLabel;
    button.appendChild(buttonText);

    const buttonIcon = document.createElement('img');
    buttonIcon.src = `${window.hlx.codeBasePath}/icons/arrow-up.svg`;
    buttonIcon.alt = 'Back to top';
    buttonIcon.className = 'download-icon';
    button.appendChild(buttonIcon);

    contentWrapper.appendChild(button);
  }
}
