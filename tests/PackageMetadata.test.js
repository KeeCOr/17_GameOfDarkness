import { describe, expect, it } from 'vitest';
import pkg from '../package.json';

describe('release package metadata', () => {
  it('contains Electron and Steam release candidate identity fields', () => {
    expect(pkg.description).toBe('A 5x5 dark tactical chess game built for single-player Steam release candidates.');
    expect(pkg.author).toBe('Jinwoo Oh');
    expect(pkg.license).toBe('UNLICENSED');
    expect(pkg.private).toBe(true);
  });

  it('uses clean copyright metadata for Windows builds', () => {
    expect(pkg.build.productName).toBe('Chess of Dark');
    expect(pkg.build.copyright).toBe('Copyright © 2026 Jinwoo Oh');
  });
});
