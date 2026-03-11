#!/usr/bin/env node

/**
 * Accessibility test runner for EDS blocks.
 *
 * Uses Playwright + axe-core to scan a page and report WCAG 2.2 AA violations
 * scoped to a specific block.
 *
 * Usage:
 *   node test-block-a11y.js --block info-counter --url http://localhost:3000/page
 */

/* eslint-disable no-console */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

const parseArgs = (argv) => {
  const args = { block: '', url: '' };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--block' && argv[i + 1]) {
      args.block = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--url' && argv[i + 1]) {
      args.url = argv[i + 1];
      i += 1;
    }
  }
  return args;
};

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const run = async () => {
  const { block, url } = parseArgs(process.argv);

  if (!block || !url) {
    console.error('Usage: node test-block-a11y.js --block <name> --url <url>');
    process.exit(1);
  }

  const outputDir = path.join(REPO_ROOT, 'test', 'tmp');
  ensureDir(outputDir);

  const axeCorePath = path.join(REPO_ROOT, 'node_modules', 'axe-core', 'axe.min.js');
  if (!fs.existsSync(axeCorePath)) {
    console.error('[a11y] axe-core not found. Run setup first:');
    console.error('  bash .claude/skills/frontend-testing/scripts/setup-testing.sh');
    process.exit(1);
  }

  const axeSource = fs.readFileSync(axeCorePath, 'utf8');

  console.log(`[a11y] Testing block "${block}" at ${url}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const blockSelector = `.${block}`;
    await page.waitForSelector(blockSelector, { timeout: 10000 }).catch(() => {
      console.warn(`[a11y] Warning: block selector "${blockSelector}" not found on page.`);
    });

    // Wait for block decoration
    await page.waitForTimeout(2000);

    // Inject axe-core and run analysis
    await page.evaluate(axeSource);

    const results = await page.evaluate(async (selector) => {
      const axeConfig = {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'],
        },
      };

      const element = document.querySelector(selector);
      if (element) {
        return window.axe.run(element, axeConfig);
      }
      return window.axe.run(axeConfig);
    }, blockSelector);

    // Write JSON report
    const reportPath = path.join(outputDir, `a11y-report-${block}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Print summary
    const { violations } = results;
    if (violations.length === 0) {
      console.log(`[a11y] PASS: No violations found for "${block}".`);
    } else {
      console.error(`[a11y] FAIL: ${violations.length} violation(s) found for "${block}":`);
      violations.forEach((v) => {
        const nodeCount = v.nodes?.length || 0;
        console.error(`  [${v.impact}] ${v.id}: ${v.description} (${nodeCount} element(s))`);
      });
    }

    console.log(`[a11y] Report saved to ${reportPath}`);
    return violations.length;
  } finally {
    await browser.close();
  }
};

run()
  .then((violationCount) => {
    process.exit(violationCount > 0 ? 1 : 0);
  })
  .catch((err) => {
    console.error('[a11y] Fatal error:', err.message);
    process.exit(1);
  });
