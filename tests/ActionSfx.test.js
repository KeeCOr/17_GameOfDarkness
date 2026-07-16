import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Kenney action SFX routing', () => {
  it('keeps the event cue set compact and backed by local Kenney assets', async () => {
    const { ACTION_SFX } = await import('../src/audio/actionSfx.js');

    expect(Object.keys(ACTION_SFX)).toEqual([
      'pieceSelect',
      'movePreview',
      'moveConfirm',
      'summonConfirm',
      'capture',
      'victory',
      'defeat',
    ]);

    expect(Object.values(ACTION_SFX)).toHaveLength(7);
    for (const sound of Object.values(ACTION_SFX)) {
      expect(sound.key).toMatch(/^kenney-/);
      expect(sound.path).toMatch(/^assets\/audio\/kenney\//);
      expect(sound.path).toMatch(/\.ogg$/);
      expect(sound.volume).toBeGreaterThan(0);
      expect(sound.volume).toBeLessThanOrEqual(0.7);
    }
  });

  it('maps game action events to the intended quiet tactical cue', async () => {
    const { getActionSfxKey } = await import('../src/audio/actionSfx.js');

    expect(getActionSfxKey('piece-select')).toBe('pieceSelect');
    expect(getActionSfxKey('move-preview')).toBe('movePreview');
    expect(getActionSfxKey({ type: 'move', capture: false })).toBe('moveConfirm');
    expect(getActionSfxKey({ type: 'summon' })).toBe('summonConfirm');
    expect(getActionSfxKey({ type: 'move', capture: true })).toBe('capture');
    expect(getActionSfxKey({ type: 'game-over', won: true })).toBe('victory');
    expect(getActionSfxKey({ type: 'game-over', won: false })).toBe('defeat');
    expect(getActionSfxKey({ type: 'unknown' })).toBe(null);
  });

  it('preloads and plays through Phaser sound when available', async () => {
    const { ACTION_SFX, preloadActionSfx, playActionSfx } = await import('../src/audio/actionSfx.js');
    const loaded = [];
    const played = [];
    const scene = {
      load: { audio: (key, path) => loaded.push({ key, path }) },
      sound: { play: (key, options) => played.push({ key, options }) },
    };

    preloadActionSfx(scene);
    playActionSfx(scene, { type: 'move', capture: true });

    expect(loaded).toContainEqual({
      key: ACTION_SFX.capture.key,
      path: ACTION_SFX.capture.path,
    });
    expect(played).toEqual([
      {
        key: ACTION_SFX.capture.key,
        options: { volume: ACTION_SFX.capture.volume },
      },
    ]);
  });

  it('does not throw when Phaser audio is unavailable', async () => {
    const { preloadActionSfx, playActionSfx } = await import('../src/audio/actionSfx.js');

    expect(() => preloadActionSfx({})).not.toThrow();
    expect(() => playActionSfx({}, { type: 'summon' })).not.toThrow();
  });

  it('wires Kenney action SFX into real GameScene events', () => {
    const source = readFileSync(new URL('../src/scenes/GameScene.js', import.meta.url), 'utf8');

    expect(source).toContain("import { preloadActionSfx, playActionSfx } from '../audio/actionSfx.js';");
    expect(source).toContain('preloadActionSfx(this);');
    expect(source).toContain("playActionSfx(this, 'piece-select');");
    expect(source).toContain("playActionSfx(this, 'move-preview');");
    expect(source).toContain("playActionSfx(this, { type: 'move', capture: isCapture });");
    expect(source).toContain("playActionSfx(this, { type: 'summon' });");
    expect(source).toContain("playActionSfx(this, { type: 'game-over', won: winner === Owner.PLAYER });");
  });
});
