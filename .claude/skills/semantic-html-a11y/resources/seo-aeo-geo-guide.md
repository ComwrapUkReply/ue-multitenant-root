# SEO, AEO, and GEO Content Structure Guide

This guide explains how to structure content in blocks so that it works well for:

- **SEO** – classic search engine optimisation
- **AEO** – answer engine optimisation (voice assistants, featured snippets)
- **GEO** – generative engine optimisation (LLMs answering from web content)

The same structural choices usually help all three.

## 1. Heading Hierarchy

### Rules

- Use exactly one `<h1>` per page (template responsibility).
- Within blocks, generally start from `<h2>` or below, based on context.
- Maintain logical nesting: `h2` → `h3` → `h4`, avoiding arbitrary jumps.
- Do not emulate headings with `<p>` + CSS; use actual `<h*>` tags.

### Why It Matters

- Search engines and LLMs both rely on heading structure to:
  - Understand topic boundaries.
  - Extract answer-sized segments.
  - Build table-of-contents style navigation.

## 2. Answerable Chunks

Think in terms of **self-contained chunks** that can stand alone as answers:

- Short paragraphs (2–4 sentences).
- Bulleted or numbered lists for steps, pros/cons, features.
- Simple Q/A pairs where appropriate.

### Patterns

**Q/A:**

```html
<section class="faq-item">
  <h3>What is the Info Counter block used for?</h3>
  <p>It highlights key numeric facts with an animated counter and supporting text.</p>
</section>
```

**Step-by-step:**

```html
<section class="process">
  <h2>How to apply for funding</h2>
  <ol>
    <li>Check your eligibility.</li>
    <li>Prepare required documents.</li>
    <li>Submit your application online.</li>
  </ol>
</section>
```

## 3. Links and CTAs

- Link and button text should clearly describe the outcome:
  - ✅ “Download sustainability report (PDF)”
  - ❌ “Click here”, “Learn more”
- Avoid multiple identical generic CTAs on the same page – they are hard for screen readers and search engines.

## 4. Images and Alt Text

- For images that convey information:
  - Describe the content or purpose concisely in `alt`.
  - Avoid keyword stuffing; focus on clarity.
- For decorative images:
  - Use `alt=""` so they are skipped by screen readers.

Well-written alt text helps both accessibility and image search.

## 5. Structured Data (High-Level)

Full structured data is usually handled globally, but blocks can be designed with it in mind:

- FAQ blocks → map well to `FAQPage` schema.
- How-to or step blocks → `HowTo` schema.
- Event blocks → `Event` schema.

If a project adds JSON-LD, having clean, predictable markup in blocks makes it easier to generate schema correctly.

## 6. GEO Considerations (LLMs)

LLMs prefer:

- Clear headings and concise paragraphs.
- Minimal boilerplate noise around key facts.
- Consistent terminology within a section.
- Explicit statements of facts (“We operate in 30+ countries.”).

When designing blocks:

- Avoid hiding key facts deep inside visual noise.
- Make sure core facts appear as plain text, not only in images.

## 7. Block Design Tips

### Cards / Facts Blocks

- Use headings for the main fact or title.
- Use one short paragraph for supporting explanation.
- Group related metrics into a section with a clear heading.

### Teasers / Hero Blocks

- Hero heading should describe the page or primary action.
- Subheading/body copy should be scannable and benefit-oriented.
- Primary CTA should clearly state the action.

### Tables

- Use `<th>` for header cells.
- Provide caption or heading describing what the table shows.

