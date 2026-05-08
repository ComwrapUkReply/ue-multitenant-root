---
name: frontend-testing
description: Automated front-end testing for EDS blocks covering accessibility (axe-core), visual regression (screenshots), and DOM semantic validation. Use after block implementation to validate a11y compliance, responsive rendering, and semantic HTML in the browser.
---

# Front-End Testing for EDS Blocks

Automated testing tool that replaces manual front-end QA for Edge Delivery Services blocks. Covers three areas:

1. **Accessibility testing** — axe-core scans against WCAG 2.2 AA
2. **Visual testing** — responsive screenshots at mobile / tablet / desktop
3. **DOM validation** — semantic HTML checks on the rendered page

## Related Skills

- **testing-blocks**: This skill is invoked from the testing-blocks workflow
- **semantic-html-a11y**: DOM validation rules come from that skill
- **building-blocks**: Indirectly invoked after implementation is complete

## When to Use

- After implementing or modifying any block
- Before opening a pull request
- When debugging accessibility or layout issues
- Standalone for auditing existing blocks

## Prerequisites

### One-Time Setup

Run the setup script to install dependencies:

```bash
bash .claude/skills/frontend-testing/scripts/setup-testing.sh
```

This installs Playwright, axe-core, and ensures `test/tmp/` is gitignored.

### Per-Test Prerequisites

- Local dev server running (`aem up` or equivalent)
- A page URL that contains the block you want to test

## Quick Start

### Full Suite (Recommended)

Run all three checks in one command:

```bash
node .claude/skills/frontend-testing/scripts/test-block-full.js \
  --block info-counter \
  --url http://localhost:3000/path-to-page
```

### Individual Tests

**Accessibility only:**

```bash
node .claude/skills/frontend-testing/scripts/test-block-a11y.js \
  --block info-counter \
  --url http://localhost:3000/path-to-page
```

**Visual only:**

```bash
node .claude/skills/frontend-testing/scripts/test-block-visual.js \
  --block info-counter \
  --url http://localhost:3000/path-to-page
```

## Test Output

All output goes to `test/tmp/` (gitignored):

```
test/tmp/
  a11y-report-{block}.json       # axe-core results
  dom-report-{block}.json        # semantic HTML violations
  screenshots/
    {block}-mobile.png            # 375px viewport
    {block}-tablet.png            # 768px viewport
    {block}-desktop.png           # 1440px viewport
```

## What Each Test Checks

### Accessibility (`test-block-a11y.js`)

- Injects axe-core via Playwright
- Scans the full page, filters to the block selector `.{block}`
- Reports violations grouped by WCAG level (A, AA)
- Checks include: color contrast, focus indicators, ARIA usage, landmarks, target sizes, heading order, alt text, form labels

### Visual (`test-block-visual.js`)

- Captures full-page screenshots at three viewports:
  - Mobile: 375 x 812
  - Tablet: 768 x 1024
  - Desktop: 1440 x 900
- Waits for network idle and block decoration before capture
- Saves PNG files for human review or PR attachment

### DOM Validation (built into `test-block-full.js`)

- Checks rendered DOM for:
  - `<p>` elements containing block-level children
  - Heading hierarchy gaps (e.g. `h2` → `h5`)
  - Images missing `alt` attribute
  - Interactive elements missing keyboard access

## Interpreting Results

### A11y Report

The JSON report contains an array of violations. Each has:

- `id` — axe rule ID (e.g. `color-contrast`)
- `impact` — `critical`, `serious`, `moderate`, `minor`
- `description` — what the rule checks
- `nodes` — affected DOM elements with selectors and fix suggestions

**Priority:** Fix `critical` and `serious` first; `moderate` and `minor` are often acceptable.

### DOM Report

Lists semantic violations with element selectors and the specific rule broken. All violations should be fixed before shipping.

### Screenshots

Review visually for:

- Layout breakage at different viewports
- Text overflow or truncation
- Missing or misaligned elements
- Correct variant rendering

## Detailed Guides

- [`resources/a11y-testing-guide.md`](resources/a11y-testing-guide.md) — axe-core config, custom rules, CI integration
- [`resources/visual-testing-guide.md`](resources/visual-testing-guide.md) — baseline management, diff strategies
