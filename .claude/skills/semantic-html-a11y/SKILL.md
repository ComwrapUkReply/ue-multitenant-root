---
name: semantic-html-a11y
description: Enforces semantic HTML, WCAG 2.2 accessibility, and SEO/AEO/GEO-oriented content structure for Edge Delivery Services blocks. Use when implementing or modifying block decoration, rich text handling, and DOM structure in blocks.
---

# Semantic HTML and Accessibility for EDS Blocks

This skill ensures that all Edge Delivery Services blocks use **semantic HTML**, comply with **WCAG 2.2** as far as practical in block code, and structure content in a way that supports **SEO**, **AEO (answer engine optimisation)** and **GEO (generative engine optimisation)**.

Use this skill whenever you:

- Implement or modify a block decorator (`blocks/*/*.js`)
- Touch rich text handling, `innerHTML`, or DOM structure
- Work on heading structures, links, or interactive elements

It is especially important during **Phase 2 (Implementation)** of the `building-blocks` skill.

## When to Use

- **ALWAYS** when you add or change DOM structure in a block:
  - Creating elements with `document.createElement`
  - Assigning `innerHTML`
  - Moving or wrapping nodes
- **ALWAYS** when you refactor or create rich text handling logic
- **BEFORE MERGE** for any block work, run the static check script in this skill

## Quick Workflow

1. **While coding:**
   - Follow the **Semantic HTML Rules** section below.
   - Follow the **WCAG 2.2 Key Points** section below for interactive behaviour.
   - Follow the **SEO / AEO / GEO Structure** guidelines when dealing with headings and text.
2. **After coding:**
   - Run the static check script:

     ```bash
     node .claude/skills/semantic-html-a11y/scripts/check-semantic-html.js blocks/info-counter/info-counter.js
     ```

     Replace the path with the block file you changed.
3. **If violations are reported:**
   - Fix the code using the suggestions.
   - Re-run the script until it exits without errors.

For detailed background and examples, see:

- [`resources/semantic-html-rules.md`](resources/semantic-html-rules.md)
- [`resources/wcag-22-checklist.md`](resources/wcag-22-checklist.md)
- [`resources/seo-aeo-geo-guide.md`](resources/seo-aeo-geo-guide.md)

---

## Semantic HTML Rules (Summary)

These rules are enforced both by convention and by the `check-semantic-html.js` script.

### 1. Never Nest Block Elements Inside `<p>`

- **Blocked pattern:**

  ```javascript
  const p = document.createElement('p');
  p.innerHTML = element.innerHTML; // element may contain <div>, <h2>, <ul>, etc.
  ```

- **Allowed pattern:**
  - For **plain text**: assign to `textContent` of a `<p>`.
  - For **HTML that may contain block elements**: parse into a temporary container and append its children directly into a **non-`p`** container (e.g. `<div>`), or unwrap a wrapper `<div>` before appending.

### 2. Do Not Use `<p>` as a Layout Container

- **Avoid** using `<p>` to hold buttons, cards, or other block-level constructs.
- Use `<div>` (or a semantic container like `<nav>`, `<section>`, `<article>`, etc.) for layout.

Example fix:

```javascript
const buttonContainer = document.createElement('div');
buttonContainer.classList.add('button-container');
buttonContainer.appendChild(button);
```

### 3. Use Proper Heading Elements

- Titles and section headings should use `<h1>`–`<h6>` rather than `<p>` with a class.
- Do **not** place `<p>` tags *inside* headings. If upstream content produces `<h1><p>…</p></h1>`, unwrap the `<p>` and keep plain text inside the heading.

### 4. Unwrap Rich Text Wrapper `<div>` Elements

When CMS rich text output produces a wrapper `<div>` around multiple `<p>`/`<ul>`/`<ol>`:

- Parse HTML in a temporary container.
- If the root is a single `<div>`, **promote its children** into the target container.

This prevents nested `<div>` noise and matches the pattern used in `info-counter`.

### 5. Use Semantic Containers

- `<figure>` with `<figcaption>` for media with captions.
- `<nav>` for navigation blocks.
- `<header>` / `<footer>` for global or section-level headers/footers.
- `<main>` for the main content region (typically outside block scope, but relevant when you work on templates).
- `<section>` and `<article>` for logical content groupings when appropriate.

### 6. Avoid Raw `innerHTML` Where Possible

- Prefer `textContent` for plain text.
- When `innerHTML` is necessary (e.g. deliberate markup), sanitize or strip editor-specific attributes and **never** pump it into a `<p>` if it may contain block-level HTML.

See [`resources/semantic-html-rules.md`](resources/semantic-html-rules.md) for more examples and anti-patterns.

---

## WCAG 2.2 Key Points (Block-Level)

Blocks cannot guarantee full page-level compliance, but they must not **introduce** violations and should actively support accessibility.

### Focus and Keyboard

- All interactive elements (links, buttons, controls) must be reachable and operable with keyboard alone.
- Use `:focus-visible` styles for clear focus indication.
- Do not remove native focus outlines without providing an accessible replacement.

### Pointer Target Size

- Ensure interactive targets are at least **24 × 24 CSS pixels** (WCAG 2.2 2.5.8).
- Use padding rather than tiny clickable icons where possible.

### Motion and Animations

- Respect `prefers-reduced-motion`: reduce or disable non-essential animations for users who request it.
- Avoid sudden or large parallax/scroll-tied animations that might cause motion sickness.

### Contrast and Text

- Ensure text and icons meet contrast ratios:
  - Normal text: 4.5:1
  - Large text (≥ 18px regular or ≥ 14px bold): 3:1
- For blocks that define custom colours, only use theme tokens that already meet contrast requirements.

### Landmarks and ARIA

- Use ARIA roles and landmarks sparingly and correctly:
  - Use native elements first (e.g. `<button>` instead of `role="button"` on `<div>`).
  - Use `aria-expanded`, `aria-hidden`, `aria-controls` etc. to expose interactive states for accordions, tabs, etc.
- Never rely solely on ARIA to fix fundamentally broken semantics.

See [`resources/wcag-22-checklist.md`](resources/wcag-22-checklist.md) for a full, block-focused checklist.

---

## SEO / AEO / GEO Structure (Summary)

### Headings and Hierarchy

- Ensure there is at most one `h1` per page (usually defined by the template, not blocks).
- Use `h2`–`h6` within blocks according to their position in the content hierarchy.
- Do not skip levels unnecessarily (e.g. avoid jumping from `h2` to `h5` without context).

### Link and Button Text

- Link and button text must be descriptive:
  - Good: “View sustainability report”
  - Bad: “Click here”, “Read more”
- Avoid using the same generic link text in multiple places on the same page.

### Content Chunking for AEO/GEO

- Prefer short, focused paragraphs and lists.
- Use `<ul>`/`<ol>` for steps, benefits, and feature lists.
- Group self-contained answers and facts in ways that are easy to extract as snippets, FAQs, or cards (e.g. Q/A patterns).

### Images and Metadata

- Provide informative `alt` attributes for non-decorative images.
- Omit `alt` or use empty `alt=""` only for purely decorative images that convey no information.

More patterns and structured data examples are in [`resources/seo-aeo-geo-guide.md`](resources/seo-aeo-geo-guide.md).

---

## Validation Checklist (Per Block Change)

Before considering a block change complete, run through this checklist:

1. [ ] No `<p>` elements are used as general layout wrappers.
2. [ ] No `<p>` contains block-level children in the **rendered HTML**.
3. [ ] Headings use `<h1>`–`<h6>` appropriately and are not emulated with `<p>` + classes.
4. [ ] Rich text content is unwrapped from any unnecessary wrapper `<div>`s.
5. [ ] Interactive elements are keyboard accessible and have visible focus.
6. [ ] All interactive targets meet minimum size guidelines.
7. [ ] Text and icon colours use theme tokens with acceptable contrast.
8. [ ] Links and buttons have descriptive text.
9. [ ] All informational images have appropriate `alt` text.
10. [ ] `check-semantic-html.js` reports **no violations** for the modified files.

If any item fails, fix the issue before shipping.

