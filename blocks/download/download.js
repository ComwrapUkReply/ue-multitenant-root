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
    color: rows[2]?.textContent?.trim(),
    buttonLabel: rows[3]?.textContent,
    downloadLink,
  };

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

    // Add file size info
    const fileSizeSpan = document.createElement('span');
    fileSizeSpan.className = 'download-file-size';
    fileInfo.appendChild(fileSizeSpan);

    contentWrapper.appendChild(fileInfo);

    // Fetch and display file size
    fetch(downloadData.downloadLink, { method: 'HEAD' })
      .then((response) => {
        const size = response.headers.get('content-length');
        if (size) {
          const sizeInMB = size / (1024 * 1024);
          const sizeInKB = size / 1024;
          const sizeText = sizeInMB >= 1
            ? `(${sizeInMB.toFixed(2)} MB)`
            : `(${sizeInKB.toFixed(2)} KB)`;
          fileSizeSpan.textContent = sizeText;
        }
      })
      .catch(() => {
        fileSizeSpan.style.display = 'none';
      });
  }

  // Create download button
  if (downloadData.downloadLink && downloadData.buttonLabel) {
    const button = document.createElement('a');
    button.className = 'download-button';
    button.href = downloadData.downloadLink;
    button.setAttribute('download', '');
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', `Download ${downloadData.buttonLabel}`);
    const buttonText = document.createElement('span');
    buttonText.textContent = downloadData.buttonLabel;
    button.appendChild(buttonText);

    // Add download icon
    const icon = document.createElement('span');
    icon.className = 'download-icon';
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);

    contentWrapper.appendChild(button);
  }
}
