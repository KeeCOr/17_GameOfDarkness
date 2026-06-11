import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LAYOUT } from '../src/config.js';

describe('Electron window sizing', () => {
  it('opens the portable app at the game content size', () => {
    const source = readFileSync(new URL('../electron/main.cjs', import.meta.url), 'utf8');

    expect(source).toContain(`const GAME_CONTENT_WIDTH = ${LAYOUT.GAME_WIDTH};`);
    expect(source).toContain(`const GAME_CONTENT_HEIGHT = ${LAYOUT.GAME_HEIGHT};`);
    expect(source).toContain('width: GAME_CONTENT_WIDTH');
    expect(source).toContain('height: GAME_CONTENT_HEIGHT');
    expect(source).toContain('minWidth: GAME_CONTENT_WIDTH');
    expect(source).toContain('minHeight: GAME_CONTENT_HEIGHT');
    expect(source).toContain('useContentSize: true');
    expect(source).toContain('resizable: false');
  });
});
