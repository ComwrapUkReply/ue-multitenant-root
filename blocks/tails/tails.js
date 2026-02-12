import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  if (!block) return;

  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }

    [...li.children].forEach((div) => {
      div.className = 'tails-card-body';
    });

    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
