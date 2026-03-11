# Accessibility Testing Guide

Detailed guide for axe-core based accessibility testing of EDS blocks.

## axe-core Overview

[axe-core](https://github.com/dequelabs/axe-core) is the industry-standard accessibility testing engine. It checks rendered DOM against WCAG 2.0, 2.1, and 2.2 rules and reports violations with actionable fix suggestions.

## Configuration

The `test-block-a11y.js` script runs axe with the following defaults:

- **Standards:** WCAG 2.2 Level AA
- **Scope:** The entire page, filtered to the block selector
- **Tags:** `wcag2a`, `wcag2aa`, `wcag22aa`, `best-practice`

### Customising Rules

To disable a specific rule for a block (use sparingly):

```javascript
const results = await axeBuilder
  .disableRules(['color-contrast'])
  .analyze();
```

Only disable rules when you have confirmed the violation is a false positive or is handled elsewhere.

## Common Violations and Fixes

### color-contrast

**Issue:** Text does not have sufficient contrast against its background.

**Fix:** Use theme tokens that have been contrast-audited. Avoid custom colours that have not been tested.

### image-alt

**Issue:** `<img>` element missing `alt` attribute.

**Fix:**
- Informational images: add descriptive `alt`.
- Decorative images: add `alt=""`.

### heading-order

**Issue:** Heading levels skip (e.g. `h2` → `h5`).

**Fix:** Ensure headings follow logical nesting. Blocks generally start at `h2` or `h3`.

### button-name / link-name

**Issue:** Interactive element has no accessible name.

**Fix:** Add text content, `aria-label`, or `aria-labelledby`.

### target-size

**Issue:** Click/touch target is smaller than 24x24 CSS pixels.

**Fix:** Add padding to increase the interactive area.

## CI Integration

To wire axe testing into CI:

1. Add a test script to `package.json`:

```json
{
  "scripts": {
    "test:a11y": "node .claude/skills/frontend-testing/scripts/test-block-a11y.js"
  }
}
```

2. Add to your GitHub Actions workflow after the lint step:

```yaml
- name: A11y test
  run: npm run test:a11y -- --block hero --url ${{ env.PREVIEW_URL }}
```

## Reporting

The JSON report follows the axe-core results format:

```json
{
  "violations": [...],
  "passes": [...],
  "incomplete": [...],
  "inapplicable": [...]
}
```

Focus on `violations` for failing checks and `incomplete` for items that need manual review.
