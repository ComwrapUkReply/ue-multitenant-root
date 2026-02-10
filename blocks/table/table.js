/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Check if a row element contains only a number (rows configuration)
 * @param {Element} row
 * @returns {number|null} The number if found, null otherwise
 */
function extractRowsConfig(row) {
  // Check if row has single cell with just a number
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
 * Get the number of columns from a row
 * @param {Element} row
 * @returns {number}
 */
function getColumnCount(row) {
  return row ? row.children.length : 1;
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
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const header = !block.classList.contains('no-header');

  const allRows = [...block.children];
  let configuredRows = 0;
  let contentRows = allRows;

  // Check if first row contains the rows configuration (a single number)
  if (allRows.length > 0) {
    const rowsConfig = extractRowsConfig(allRows[0]);
    if (rowsConfig !== null) {
      configuredRows = rowsConfig;
      contentRows = allRows.slice(1); // Skip the config row
    }
  }

  // Get column count from the first actual content row
  const columnCount = contentRows.length > 0 ? getColumnCount(contentRows[0]) : 1;

  // Process content rows (skip the config row which we already extracted)
  contentRows.forEach((row, i) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);

    [...row.children].forEach((cell) => {
      const td = document.createElement(i === 0 && header ? 'th' : 'td');

      if (i === 0) td.setAttribute('scope', 'column');
      td.innerHTML = cell.innerHTML;
      tr.append(td);
    });
    if (i === 0 && header) thead.append(tr);
    else tbody.append(tr);
  });

  // Add empty rows if configured rows exceed content rows
  const dataRowCount = header ? contentRows.length - 1 : contentRows.length;
  if (configuredRows > dataRowCount) {
    const emptyRowsNeeded = configuredRows - dataRowCount;
    for (let i = 0; i < emptyRowsNeeded; i += 1) {
      tbody.append(createEmptyRow(columnCount, false));
    }
  }

  table.append(thead, tbody);
  block.replaceChildren(table);
}
