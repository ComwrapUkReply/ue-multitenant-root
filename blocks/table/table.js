/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Check if a row element contains only a number (configuration value)
 * @param {Element} row
 * @returns {number|null} The number if found, null otherwise
 */
function extractNumberConfig(row) {
  if (row.children.length === 1) {
    const text = row.children[0].textContent.trim();
    const num = parseInt(text, 10);
    if (!Number.isNaN(num) && String(num) === text) {
      return num;
    }
  }
  return null;
}

/**
 * Create an empty row with the specified number of columns
 * @param {number} columnCount
 * @param {boolean} isHeader
 * @returns {HTMLTableRowElement}
 */
function createEmptyRow(columnCount, isHeader = false) {
  const tr = document.createElement('tr');
  for (let i = 0; i < columnCount; i += 1) {
    const cell = document.createElement(isHeader ? 'th' : 'td');
    if (isHeader) cell.setAttribute('scope', 'column');
    tr.append(cell);
  }
  return tr;
}

/**
 * Create a row from content, adjusting to match the configured column count
 * @param {Element} sourceRow - The source row element
 * @param {number} configuredColumns - The configured number of columns
 * @param {boolean} isHeader - Whether this is a header row
 * @returns {HTMLTableRowElement}
 */
function createRowFromContent(sourceRow, configuredColumns, isHeader) {
  const tr = document.createElement('tr');
  moveInstrumentation(sourceRow, tr);

  const sourceCells = [...sourceRow.children];

  // Create cells up to the configured column count
  for (let i = 0; i < configuredColumns; i += 1) {
    const cell = document.createElement(isHeader ? 'th' : 'td');
    if (isHeader) cell.setAttribute('scope', 'column');

    // Use content from source cell if available
    if (i < sourceCells.length) {
      cell.innerHTML = sourceCells[i].innerHTML;
    }

    tr.append(cell);
  }

  return tr;
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const header = !block.classList.contains('no-header');

  const allRows = [...block.children];
  let configuredColumns = 1;
  let configuredRows = 0;
  let contentStartIndex = 0;

  // Extract configuration values from the beginning rows
  // First config row: columns
  if (allRows.length > 0) {
    const columnsConfig = extractNumberConfig(allRows[0]);
    if (columnsConfig !== null) {
      configuredColumns = columnsConfig;
      contentStartIndex = 1;

      // Second config row: rows
      if (allRows.length > 1) {
        const rowsConfig = extractNumberConfig(allRows[1]);
        if (rowsConfig !== null) {
          configuredRows = rowsConfig;
          contentStartIndex = 2;
        }
      }
    }
  }

  // Get content rows (after configuration rows)
  const contentRows = allRows.slice(contentStartIndex);

  // Process content rows
  contentRows.forEach((row, i) => {
    const isHeaderRow = i === 0 && header;
    const tr = createRowFromContent(row, configuredColumns, isHeaderRow);

    if (isHeaderRow) {
      thead.append(tr);
    } else {
      tbody.append(tr);
    }
  });

  // Add empty rows if configured rows exceed content rows
  const dataRowCount = header ? contentRows.length - 1 : contentRows.length;
  if (configuredRows > dataRowCount) {
    const emptyRowsNeeded = configuredRows - dataRowCount;
    for (let i = 0; i < emptyRowsNeeded; i += 1) {
      tbody.append(createEmptyRow(configuredColumns, false));
    }
  }

  // If no content rows but we have configuration, create header and empty rows
  if (contentRows.length === 0 && (configuredColumns > 0 || configuredRows > 0)) {
    if (header) {
      thead.append(createEmptyRow(configuredColumns, true));
    }
    for (let i = 0; i < configuredRows; i += 1) {
      tbody.append(createEmptyRow(configuredColumns, false));
    }
  }

  table.append(thead, tbody);
  block.replaceChildren(table);
}
