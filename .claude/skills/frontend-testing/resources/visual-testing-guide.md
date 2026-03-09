# Visual Testing Guide

Guide for screenshot-based visual testing of EDS blocks.

## Overview

Visual testing captures screenshots at standard viewports and saves them for human review. This replaces the manual step of opening the page in a browser and resizing the window.

## Viewports

The `test-block-visual.js` script captures at three breakpoints:

| Name    | Width | Height | Use Case                |
|---------|-------|--------|-------------------------|
| mobile  | 375   | 812    | iPhone-class devices    |
| tablet  | 768   | 1024   | iPad-class devices      |
| desktop | 1440  | 900    | Standard desktop screen |

## Screenshot Strategy

### Full Page vs Element

- **Default:** Full-page screenshot (captures the block in its page context).
- **Block-only:** If `--block` is provided, the script also captures a cropped screenshot of just the block element.

### Waiting Strategy

The script waits for:

1. Network idle (no pending requests for 500ms)
2. Block decoration complete (`data-block-status="loaded"`)
3. Animations settled (waits an additional 1 second after decoration)

## Baseline Comparison (Optional)

For projects that want visual regression testing:

1. Save approved screenshots to `test/baselines/{block}-{viewport}.png`.
2. Run `test-block-visual.js` with `--compare` flag.
3. The script will pixel-diff against baselines and report percentage change.

This is optional and not set up by default.

## Using Screenshots

### In PRs

Attach screenshots to PR descriptions to show reviewers what the block looks like at each viewport. This speeds up review significantly.

### For Debugging

Compare screenshots before and after a change to spot unintended visual regressions.

## Tips

- Run visual tests with a clean browser profile (Playwright handles this automatically).
- Ensure the dev server is using consistent test content — different content lengths produce different screenshots.
- For blocks with animation, the 1-second post-decoration wait handles most cases. Increase with `--wait` flag if needed.
