#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const WIKI = 'https://github.com/shanteacontrols/OpenDeck/wiki/';
const RAW = 'https://raw.githubusercontent.com/wiki/shanteacontrols/OpenDeck/';
const OUTPUT = path.resolve(__dirname, '../_data/boards.json');

function parseIndex(markdown) {
  const boards = new Map();
  for (const match of markdown.matchAll(/^\s*[-*]\s+\[([^\]]+)\]\(([^\s)]+)\)/gm)) {
    let [, name, destination] = match;
    if (destination.startsWith(WIKI)) destination = destination.slice(WIKI.length);
    if (/^(?:#|[a-z]+:|\/)/i.test(destination)) continue;
    const slug = decodeURIComponent(destination.split('#')[0]).replace(/\.md$/, '');
    if (!slug || slug.includes('/') || slug.includes('\\')) continue;
    if (!boards.has(slug)) boards.set(slug, { name, slug });
  }
  if (!boards.size) throw new Error('Supported-boards.md contains no board links.');
  return [...boards.values()];
}

function parseBoard(board, markdown) {
  // Each board page places its board photo before its pinouts and wiring images.
  const imageMatch = markdown.match(/!\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)/);
  if (!imageMatch) throw new Error(`${board.slug}: no board photo found.`);
  let image = imageMatch[1];
  if (image.startsWith(WIKI)) image = RAW + image.slice(WIKI.length);
  if (image.startsWith('https://github.com/shanteacontrols/OpenDeck.wiki/blob/')) {
    image = RAW + image.replace(/^https:\/\/github\.com\/shanteacontrols\/OpenDeck\.wiki\/blob\/[^/]+\//, '');
  }
  image = new URL(image, RAW).href;
  if (!image.startsWith('https://')) throw new Error(`${board.slug}: photo must use HTTPS.`);
  function field(name) {
    const match = markdown.match(new RegExp(`^\\s*[-*]\\s+${name}:\\s*(.+)$`, 'mi'));
    return match ? match[1].trim() : 'See board guide';
  }
  return {
    name: board.name,
    image,
    url: WIKI + encodeURIComponent(board.slug),
    midi: field('MIDI'),
    osc: field('OSC')
  };
}

async function fetchText(url) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
      return await response.text();
    } catch (error) { lastError = error; }
  }
  throw lastError;
}

async function syncBoards() {
  const index = parseIndex(await fetchText(RAW + 'Supported-boards.md'));
  const boards = new Array(index.length);
  let next = 0;
  // Limit simultaneous requests; preserve index order regardless of response order.
  await Promise.all(Array.from({ length: Math.min(5, index.length) }, async () => {
    while (next < index.length) {
      const i = next++;
      boards[i] = parseBoard(index[i], await fetchText(RAW + encodeURIComponent(index[i].slug) + '.md'));
    }
  }));
  boards.sort((a, b) => {
    const official = name => /^Official OpenDeck/.test(name) ? 0 : 1;
    return official(a.name) - official(b.name) || a.name.localeCompare(b.name, 'en');
  });
  const content = JSON.stringify(boards, null, 2) + '\n';
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  if (!fs.existsSync(OUTPUT) || fs.readFileSync(OUTPUT, 'utf8') !== content) {
    const temporary = OUTPUT + '.tmp';
    fs.writeFileSync(temporary, content);
    fs.renameSync(temporary, OUTPUT);
  }
  console.log(`Synced ${boards.length} boards from the OpenDeck GitHub wiki.`);
}

if (require.main === module) {
  syncBoards().catch(error => {
    const snapshot = (() => {
      try { const data = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); return Array.isArray(data) && data.length > 0; }
      catch { return false; }
    })();
    if (snapshot && !process.argv.includes('--strict')) {
      console.warn(`Board sync warning: ${error.message}\nUsing the last successful board snapshot.`);
    } else {
      console.error(`Board sync failed: ${error.message}`);
      process.exitCode = 1;
    }
  });
}

module.exports = { parseIndex, parseBoard };
