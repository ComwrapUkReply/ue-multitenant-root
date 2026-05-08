#!/usr/bin/env node

/**
 * Full front-end test suite for EDS blocks.
 *
 * Runs accessibility, visual, and DOM semantic validation in one pass.
 *
 * Usage:
 *   node test-block-full.js --block info-counter --url http://localhost:3000/page
 */

/* eslint-disable no-console */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const BLOCK_LEVEL_TAGS = new Set([
  'DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'UL', 'OL', 'LI', 'FIGURE', 'FIGCAPTION', 'BLOCKQUOTE',
  'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD',
  'SECTION', 'ARTICLE', 'ASIDE', 'HEADER', 'FOOTER', 'NAV', 'MAIN',
  'FORM', 'FIELDSET', 'DL', 'DT', 'DD', 'ADDRESS', 'PRE',
]);

const parseArgs = (argv) => {
  const args = { block: '', url: '', wait: 1500 };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--block' && argv[i + 1]) {
      args.block = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--url' && argv[i + 1]) {
      args.url = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--wait' && argv[i + 1]) {
      args.wait = parseInt(argv[i + 1], 10) || 1500;
      i += 1;
    }
  }
  return args;
};

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

// ─── DOM Validation (runs in the browser context) ───────────────────────────

const domValidationScript = ({ selector, tags }) => {
  const violations = [];
  const root = selector
    ? document.querySelector(selector)
    : document.body;

  if (!root) return violations;

  function getSelector(el) {
    if (el.id) return `#${el.id}`;
    const parts = [];
    let current = el;
    while (current && current !== document.body) {
      let s = current.tagName.toLowerCase();
      if (current.className && typeof current.className === 'string') {
        s += `.${current.className.trim().split(/\s+/).join('.')}`;
      }
      parts.unshift(s);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  // 1. <p> containing block-level children
  root.querySelectorAll('p').forEach((p) => {
    Array.from(p.children).forEach((child) => {
      if (tags.includes(child.tagName)) {
        violations.push({
          rule: 'no-block-in-p',
          message: `<p> contains block-level <${child.tagName.toLowerCase()}>`,
          selector: getSelector(p),
        });
      }
    });
  });

  // 2. Heading hierarchy
  const headings = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  for (let i = 1; i < headings.length; i += 1) {
    const prev = parseInt(headings[i - 1].tagName[1], 10);
    const curr = parseInt(headings[i].tagName[1], 10);
    if (curr > prev + 1) {
      violations.push({
        rule: 'heading-hierarchy',
        message: `Heading jumps from <h${prev}> to <h${curr}>`,
        selector: getSelector(headings[i]),
      });
    }
  }

  // 3. Images missing alt
  root.querySelectorAll('img').forEach((img) => {
    if (!img.hasAttribute('alt')) {
      violations.push({
        rule: 'img-alt',
        message: '<img> missing alt attribute',
        selector: getSelector(img),
      });
    }
  });

  // 4. Interactive elements without keyboard access
  root.querySelectorAll('[onclick], [role="button"]').forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (tag !== 'button' && tag !== 'a' && tag !== 'input' && tag !== 'select' && tag !== 'textarea') {
      if (!el.hasAttribute('tabindex')) {
        violations.push({
          rule: 'keyboard-access',
          message: `Interactive element <${tag}> lacks tabindex or is not a native interactive element`,
          selector: getSelector(el),
        });
      }
    }
  });

  return violations;
};

// ─── Main ───────────────────────────────────────────────────────────────────

const run = async () => {
  const { block, url, wait } = parseArgs(process.argv);

  if (!block || !url) {
    console.error('Usage: node test-block-full.js --block <name> --url <url> [--wait <ms>]');
    process.exit(1);
  }

  const outputDir = path.join(REPO_ROOT, 'test', 'tmp');
  const screenshotDir = path.join(outputDir, 'screenshots');
  ensureDir(screenshotDir);

  const blockSelector = `.${block}`;
  let totalIssues = 0;

  console.log(`\n[full-test] Block: "${block}" | URL: ${url}\n`);

  const browser = await chromium.launch({ headless: true });

  try {
    // ── 1. A11y Test ──────────────────────────────────────────────────────

    console.log('─── Accessibility Test ───');

    const axeCorePath = path.join(REPO_ROOT, 'node_modules', 'axe-core', 'axe.min.js');
    const hasAxe = fs.existsSync(axeCorePath);

    if (hasAxe) {
      const axeSource = fs.readFileSync(axeCorePath, 'utf8');
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForSelector(blockSelector, { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(wait);

      await page.evaluate(axeSource);

      const results = await page.evaluate(async (selector) => {
        const config = {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'] },
        };
        const el = document.querySelector(selector);
        return el ? window.axe.run(el, config) : window.axe.run(config);
      }, blockSelector);

      const reportPath = path.join(outputDir, `a11y-report-${block}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

      if (results.violations.length === 0) {
        console.log('  PASS: No accessibility violations.\n');
      } else {
        console.error(`  FAIL: ${results.violations.length} violation(s):`);
        results.violations.forEach((v) => {
          console.error(`    [${v.impact}] ${v.id}: ${v.description}`);
        });
        console.log('');
        totalIssues += results.violations.length;
      }

      await context.close();
    } else {
      console.warn('  SKIPPED: axe-core not installed. Run setup-testing.sh first.\n');
    }

    // ── 2. DOM Validation ─────────────────────────────────────────────────

    console.log('─── DOM Semantic Validation ───');

    const domContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const domPage = await domContext.newPage();

    await domPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await domPage.waitForSelector(blockSelector, { timeout: 10000 }).catch(() => {});
    await domPage.waitForTimeout(wait);

    const blockTagsArr = Array.from(BLOCK_LEVEL_TAGS);
    const domViolations = await domPage.evaluate(
      domValidationScript,
      { selector: blockSelector, tags: blockTagsArr },
    );

    const domReportPath = path.join(outputDir, `dom-report-${block}.json`);
    fs.writeFileSync(domReportPath, JSON.stringify(domViolations, null, 2));

    if (domViolations.length === 0) {
      console.log('  PASS: No semantic HTML violations.\n');
    } else {
      console.error(`  FAIL: ${domViolations.length} violation(s):`);
      domViolations.forEach((v) => {
        console.error(`    [${v.rule}] ${v.message} — ${v.selector}`);
      });
      console.log('');
      totalIssues += domViolations.length;
    }

    await domContext.close();

    // ── 3. Visual Test ────────────────────────────────────────────────────

    console.log('─── Visual Screenshots ───');

    for (const viewport of VIEWPORTS) {
      const vCtx = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const vPage = await vCtx.newPage();

      await vPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await vPage.waitForSelector(blockSelector, { timeout: 10000 }).catch(() => {});
      await vPage.waitForTimeout(wait);

      const ssPath = path.join(screenshotDir, `${block}-${viewport.name}.png`);
      await vPage.screenshot({ path: ssPath, fullPage: true });
      console.log(`  Saved: ${ssPath}`);

      const blockEl = await vPage.$(blockSelector);
      if (blockEl) {
        const blockPath = path.join(screenshotDir, `${block}-${viewport.name}-block.png`);
        await blockEl.screenshot({ path: blockPath });
        console.log(`  Saved: ${blockPath}`);
      }

      await vCtx.close();
    }

    console.log('');

    // ── Summary ───────────────────────────────────────────────────────────

    if (totalIssues === 0) {
      console.log(`[full-test] ALL PASSED for "${block}".`);
    } else {
      console.error(`[full-test] ${totalIssues} issue(s) found for "${block}".`);
    }

    return totalIssues;
  } finally {
    await browser.close();
  }
};

run()
  .then((issues) => process.exit(issues > 0 ? 1 : 0))
  .catch((err) => {
    console.error('[full-test] Fatal error:', err.message);
    process.exit(1);
  });
