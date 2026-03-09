#!/usr/bin/env node

/**
 * Visual test runner for EDS blocks.
 *
 * Captures screenshots at mobile, tablet, and desktop viewports.
 *
 * Usage:
 *   node test-block-visual.js --block info-counter --url http://localhost:3000/page
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

const parseArgs = (argv) => {
  const args = { block: '', url: '', wait: 1000 };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--block' && argv[i + 1]) {
      args.block = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--url' && argv[i + 1]) {
      args.url = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--wait' && argv[i + 1]) {
      args.wait = parseInt(argv[i + 1], 10) || 1000;
      i += 1;
    }
  }
  return args;
};

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const run = async () => {
  const { block, url, wait } = parseArgs(process.argv);

  if (!block || !url) {
    console.error('Usage: node test-block-visual.js --block <name> --url <url> [--wait <ms>]');
    process.exit(1);
  }

  const screenshotDir = path.join(REPO_ROOT, 'test', 'tmp', 'screenshots');
  ensureDir(screenshotDir);

  console.log(`[visual] Testing block "${block}" at ${url}`);

  const browser = await chromium.launch({ headless: true });

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      const blockSelector = `.${block}`;
      await page.waitForSelector(blockSelector, { timeout: 10000 }).catch(() => {
        console.warn(`[visual] Warning: "${blockSelector}" not found at ${viewport.name}.`);
      });

      // Wait for animations to settle
      await page.waitForTimeout(wait);

      // Full page screenshot
      const fullPath = path.join(screenshotDir, `${block}-${viewport.name}.png`);
      await page.screenshot({ path: fullPath, fullPage: true });
      console.log(`[visual] Saved: ${fullPath}`);

      // Block-only screenshot (if element exists)
      const blockElement = await page.$(blockSelector);
      if (blockElement) {
        const blockPath = path.join(screenshotDir, `${block}-${viewport.name}-block.png`);
        await blockElement.screenshot({ path: blockPath });
        console.log(`[visual] Saved: ${blockPath}`);
      }

      await context.close();
    }

    console.log('[visual] All screenshots captured.');
  } finally {
    await browser.close();
  }
};

run().catch((err) => {
  console.error('[visual] Fatal error:', err.message);
  process.exit(1);
});
