export function renderButton({
  link, label, target, block,
}) {
  const button = document.createElement('a');
  button.className = 'button';
  button.title = label;
  if (target !== '') button.target = target;

  // Wrap label text in a span element
  const span = document.createElement('span');
  span.textContent = label;
  button.appendChild(span);

  let href = link;
  block.classList.forEach((className) => {
    if (className === 'telephone') href = `tel:${link}`;
    if (className === 'email') href = `mailto:${link}`;
    if (className === 'download') button.download = '';
  });

  button.href = href;

  return button;
}

export default renderButton;
