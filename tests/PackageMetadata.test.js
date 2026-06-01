import { describe, expect, it } from 'vitest';
import pkg from '../package.json';

describe('release package metadata', () => {
  it('contains Electron and Steam release candidate identity fields', () => {
    expect(pkg.description).toBe('A 5x5 tactical chess-summoning game built for single-player Steam release candidates.');
    expect(pkg.author).toBe('Jinwoo Oh');
    expect(pkg.license).toBe('UNLICENSED');
    expect(pkg.private).toBe(true);
  });

  it('uses clean copyright metadata for Windows builds', () => {
    expect(pkg.build.productName).toBe('Chess Summon');
    expect(pkg.build.copyright).toBe('Copyright © 2026 Jinwoo Oh');
  });
});
