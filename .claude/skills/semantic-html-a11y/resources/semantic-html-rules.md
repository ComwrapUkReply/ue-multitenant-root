# Semantic HTML Rules for EDS Blocks

This reference expands on the summary rules in `SKILL.md`. Use it when implementing or reviewing DOM-related code in blocks.

## 1. Block vs Inline Elements

### Block Elements (Common)

These must **not** be children of `<p>`:

- `div`, `p`, `h1`–`h6`
- `ul`, `ol`, `li`
- `figure`, `figcaption`
- `blockquote`
- `table`, `thead`, `tbody`, `tr`, `th`, `td`
- `section`, `article`, `aside`, `header`, `footer`, `nav`, `main`

### Inline Elements (Safe inside `<p>`)

These can appear inside `<p>`:

- `a`, `span`, `strong`, `em`, `b`, `i`, `u`, `small`, `sup`, `sub`
- `code`, `kbd`, `samp`
- `img` (if behaving like inline image, e.g. icon-level)

When in doubt, do **not** put it inside `<p>`.

## 2. Patterns to Avoid

### 2.1 `createElement('p')` + `innerHTML`

```javascript
const p = document.createElement('p');
p.innerHTML = sourceElement.innerHTML;
```

If `sourceElement` may contain headings, lists, divs, or other blocks, this produces invalid markup. Instead:

```javascript
const wrapper = document.createElement('div');
wrapper.classList.add('my-block-text');

const temp = document.createElement('div');
temp.innerHTML = sourceElement.innerHTML;

Array.from(temp.childNodes).forEach((node) => {
  wrapper.appendChild(node);
});
```

Or, if you know the content is plain text:

```javascript
const p = document.createElement('p');
p.textContent = sourceElement.textContent;
wrapper.appendChild(p);
```

### 2.2 `<p>` as a Generic Container

Avoid:

```javascript
const buttonContainer = document.createElement('p');
buttonContainer.classList.add('button-container');
buttonContainer.appendChild(button);
```

Use:

```javascript
const buttonContainer = document.createElement('div');
buttonContainer.classList.add('button-container');
buttonContainer.appendChild(button);
```

### 2.3 Heading Content in `<p>`

Avoid:

```javascript
const title = document.createElement('p');
title.classList.add('my-block-title');
title.textContent = headingText;
```

Use:

```javascript
const title = document.createElement('h2');
title.classList.add('my-block-title');
title.textContent = headingText;
```

## 3. Rich Text Handling Patterns

Rich text from the authoring environment (Universal Editor, AEM, etc.) often arrives as HTML with wrapper `<div>` and metadata attributes (`data-aue-*`, `data-richtext-*`).

### 3.1 Safe Rich Text Insertion

**Goal:** Preserve author markup while ensuring semantic, valid output.

```javascript
const container = document.createElement('div');
container.classList.add('my-block-text');

let html = descriptionHTML || descriptionText;

// Clean editor attributes
if (hasUEAttributes(html)) {
  html = cleanHTML(html);
}

const temp = document.createElement('div');
temp.innerHTML = html;
removeAueAttributes(temp);

const children = Array.from(temp.children);

if (children.length === 0) {
  const p = document.createElement('p');
  p.textContent = temp.textContent.trim();
  container.appendChild(p);
} else if (children.length === 1 && children[0].tagName === 'DIV') {
  // Promote grandchildren of wrapper div
  Array.from(children[0].childNodes).forEach((node) => container.appendChild(node));
} else {
  children.forEach((child) => container.appendChild(child));
}
```

### 3.2 Unwrapping `<p>` Inside Headings

Sometimes upstream HTML may look like:

```html
<h1><p>Heading Text</p></h1>
```

Fix at decoration time:

```javascript
const heading = document.createElement('h1');
heading.innerHTML = headingHtml;

heading.querySelectorAll('p').forEach((p) => {
  p.replaceWith(...p.childNodes);
});
```

## 4. Semantic Structures by Block Type

### 4.1 Counter Blocks (Info Counter)

- Number:
  - Use `<div class="info-counter-number">` containing digit spans.
- Text:
  - Use `<div class="info-counter-text">` containing one or more `<p>` elements.
- No `<p>` around the entire number/text pair.

### 4.2 Card Blocks

Recommended pattern:

```html
<article class="card">
  <figure class="card-media">
    <img src="..." alt="..." />
    <figcaption>Optional caption</figcaption>
  </figure>
  <h3 class="card-title">Title</h3>
  <p class="card-body">Body text…</p>
  <a class="card-link" href="...">Learn more</a>
</article>
```

### 4.3 Text-Only Blocks

```html
<section class="my-text-block">
  <h2>Section heading</h2>
  <p>Paragraph one…</p>
  <p>Paragraph two…</p>
</section>
```

Avoid stacking multiple headings without body text unless the design explicitly calls for it.

## 5. Common Anti-Patterns and Fixes

### Anti-Pattern: Facts & Figures Cards

```javascript
descriptionElements.forEach((element) => {
  const p = document.createElement('p');
  p.innerHTML = element.innerHTML;
  descriptionWrapper.appendChild(p);
  element.remove();
});
```

**Fix:** Promote children of `element` directly into `descriptionWrapper`, or use the rich text pattern above.

### Anti-Pattern: Hero Button Container

```javascript
const buttonContainer = document.createElement('p');
buttonContainer.classList.add('button-container');
```

**Fix:** `div` container as shown earlier.

