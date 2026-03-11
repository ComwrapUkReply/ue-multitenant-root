#!/usr/bin/env node

/**
 * Static semantic HTML checker for block decorator files.
 *
 * This script performs lightweight, pattern-based checks on JS files to catch
 * common issues such as:
 * - <p> being used as a generic container
 * - createElement('p') followed by innerHTML assignment
 * - headings being created as <p> elements
 *
 * Usage:
 *   node .claude/skills/semantic-html-a11y/scripts/check-semantic-html.js blocks/info-counter/info-counter.js
 */

/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXIT_OK = 0;
const EXIT_ERROR = 1;

const PATTERNS = {
  pCreate: /createElement\(['"`]p['"`]\)/g,
  headingAsP: /createElement\(['"`]p['"`]\)[^;]*\.[^;\n]*classList\.add\(['"`](?:.*title.*|.*heading.*)['"`]\)/i,
};

/**
 * Detect createElement('p') whose variable later gets .innerHTML assignment.
 * Uses line-level analysis to avoid broad false-positive matching.
 */
const detectPInnerHTML = (source) => {
  const lines = source.split('\n');
  const pVarPattern = /(?:const|let|var)\s+(\w+)\s*=\s*(?:\w+\.)?createElement\(['"`]p['"`]\)/;
  const found = [];

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(pVarPattern);
    if (!match) continue;

    const varName = match[1];
    const innerHTMLPattern = new RegExp(`\\b${varName}\\.innerHTML\\s*=`);

    for (let j = i + 1; j < Math.min(i + 30, lines.length); j += 1) {
      if (innerHTMLPattern.test(lines[j])) {
        found.push({ variable: varName, createLine: i + 1, assignLine: j + 1 });
        break;
      }
    }
  }

  return found;
};

const readFileSafe = (targetPath) => {
  try {
    return fs.readFileSync(targetPath, 'utf8');
  } catch (error) {
    console.error(`[semantic-html-a11y] Failed to read file: ${targetPath}`);
    console.error(error.message);
    process.exit(EXIT_ERROR);
  }

  return '';
};

const checkFile = (targetPath) => {
  const source = readFileSafe(targetPath);
  const relative = path.relative(process.cwd(), targetPath);

  const errors = [];
  const warnings = [];

  const pInnerHTMLHits = detectPInnerHTML(source);
  pInnerHTMLHits.forEach(({ variable, createLine, assignLine }) => {
    errors.push(
      `[ERROR] Variable "${variable}" created as <p> (line ${createLine}) then assigned .innerHTML (line ${assignLine}). ` +
        'This may introduce block elements inside <p>. Parse into a wrapper <div> or use textContent.',
    );
  });

  if (PATTERNS.headingAsP.test(source)) {
    errors.push(
      '[ERROR] Heading-like element (class contains "title" or "heading") created as <p>. ' +
        'Use <h2>–<h6> for headings instead of <p>.',
    );
  }

  // Count generic <p> creation — informational, not an error
  const pCreateMatches = source.match(PATTERNS.pCreate) || [];
  if (pCreateMatches.length > 0) {
    warnings.push(
      `[INFO] Detected ${pCreateMatches.length} use(s) of createElement('p'). ` +
        'Verify none are used as generic layout containers (use <div> instead).',
    );
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`[semantic-html-a11y] OK: ${relative}`);
    return { errors: [], warnings: [] };
  }

  if (errors.length > 0) {
    console.error(`[semantic-html-a11y] ERRORS in ${relative}:`);
    errors.forEach((msg) => console.error(`  ${msg}`));
  }

  if (warnings.length > 0) {
    console.warn(`[semantic-html-a11y] Warnings in ${relative}:`);
    warnings.forEach((msg) => console.warn(`  ${msg}`));
  }

  return { errors, warnings };
};

const main = () => {
  const [, , ...args] = process.argv;

  if (args.length === 0) {
    console.error(
      'Usage: node .claude/skills/semantic-html-a11y/scripts/check-semantic-html.js <path/to/block.js> [...moreFiles]',
    );
    process.exit(EXIT_ERROR);
  }

  let errorCount = 0;

  args.forEach((arg) => {
    const resolved = path.resolve(process.cwd(), arg);
    const stats = fs.existsSync(resolved) ? fs.statSync(resolved) : null;

    if (!stats) {
      console.error(`[semantic-html-a11y] File not found: ${arg}`);
      errorCount += 1;
      return;
    }

    if (stats.isDirectory()) {
      console.error(
        `[semantic-html-a11y] "${arg}" is a directory. Please pass specific JS files (e.g., blocks/foo/foo.js).`,
      );
      errorCount += 1;
      return;
    }

    const { errors } = checkFile(resolved);
    errorCount += errors.length;
  });

  process.exit(errorCount > 0 ? EXIT_ERROR : EXIT_OK);
};

main();

