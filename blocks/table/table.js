/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Get the number of columns from the first row of content
 * @param {Element} block
 * @returns {number}
 */
function getColumnCount(block) {
  const firstRow = block.children[0];
  return firstRow ? firstRow.children.length : 1;
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

  // Get the configured number of rows (from data attribute set by Universal Editor)
  const configuredRows = parseInt(block.getAttribute('data-rows'), 10) || 0;
  const columnCount = getColumnCount(block);
  const contentRows = [...block.children];
  const contentRowCount = contentRows.length;

  // Process existing content rows
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
  const dataRowCount = header ? contentRowCount - 1 : contentRowCount;
  if (configuredRows > dataRowCount) {
    const emptyRowsNeeded = configuredRows - dataRowCount;
    for (let i = 0; i < emptyRowsNeeded; i += 1) {
      tbody.append(createEmptyRow(columnCount, false));
    }
  }

  table.append(thead, tbody);
  block.replaceChildren(table);
}
