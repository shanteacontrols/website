'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseIndex, parseBoard } = require('./sync-boards');

test('discovers newly indexed boards without a hardcoded list', () => {
  assert.deepEqual(parseIndex([
    '- [Manufacturer](#manufacturer)',
    '- [New sensor board](New-Sensor-Board)',
    '- [Same board](New-Sensor-Board)',
    '- [Another board](https://github.com/shanteacontrols/OpenDeck/wiki/Another-Board.md)',
    '- [Vendor](https://example.com/board)'
  ].join('\n')), [
    { name: 'New sensor board', slug: 'New-Sensor-Board' },
    { name: 'Another board', slug: 'Another-Board' }
  ]);
});

test('uses the board photo rather than later wiring diagrams and reads transport metadata', () => {
  const board = parseBoard({ name: 'Future board', slug: 'Future-Board' }, [
    '![](img/boards/future.webp)', '* MIDI: USB, DIN', '* OSC: Ethernet',
    '![](img/pinouts/future.webp)'
  ].join('\n'));
  assert.equal(board.image, 'https://raw.githubusercontent.com/wiki/shanteacontrols/OpenDeck/img/boards/future.webp');
  assert.equal(board.url, 'https://github.com/shanteacontrols/OpenDeck/wiki/Future-Board');
  assert.equal(board.midi, 'USB, DIN');
  assert.equal(board.osc, 'Ethernet');
});

test('accepts absolute GitHub wiki photo links and does not guess missing metadata', () => {
  const board = parseBoard({ name: 'Board', slug: 'Board' }, '![](https://github.com/shanteacontrols/OpenDeck/wiki/img/boards/board.webp)');
  assert.equal(board.image, 'https://raw.githubusercontent.com/wiki/shanteacontrols/OpenDeck/img/boards/board.webp');
  assert.equal(board.midi, 'See board guide');
  assert.equal(board.osc, 'See board guide');
});

test('rejects empty indexes and board pages without photos', () => {
  assert.throws(() => parseIndex('- [Section](#section)'), /no board links/);
  assert.throws(() => parseBoard({ name: 'Board', slug: 'Board' }, '* MIDI: USB'), /no board photo/);
});
