import { describe, expect, it, vi } from 'vitest';
import { DUCK_FACTOR, GameAudioDirector } from './GameAudioDirector.js';

function factory(created) {
  return () => {
    const handlers = {};
    const audio = {
      src: '', loop: false, volume: 0, currentTime: 0, paused: true, duration: Number.NaN,
      addEventListener: (name, fn) => { handlers[name] = fn; },
      emit: (name) => handlers[name]?.(),
      play: vi.fn(function play() { this.paused = false; return Promise.resolve(); }),
      pause: vi.fn(function pause() { this.paused = true; }),
    };
    created.push(audio);
    return audio;
  };
}

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

function harness(options = {}) {
  const created = [];
  let now = 0;
  let timer = null;
  const director = new GameAudioDirector({
    audioFactory: options.audioFactory ?? factory(created),
    bgmUrl: '/bgm.ogg',
    cues: {
      ui: { src: '/ui.ogg', category: 'ui', gain: 0.5 },
      action: { src: '/action.ogg', category: 'action', gain: 1 },
      danger: { src: '/danger.ogg', category: 'danger', gain: 1 },
      result: { src: '/result.ogg', category: 'result', gain: 1 },
    },
    storage: options.storage ?? storage(), maxSfx: options.maxSfx ?? 8,
    now: () => now,
    setTimer: (fn, delay) => { timer = { fn, at: now + delay }; return timer; },
    clearTimer: () => { timer = null; },
  });
  return { created, director, advance(ms) { now += ms; if (timer && timer.at <= now) { const fn = timer.fn; timer = null; fn(); } } };
}

describe('GameAudioDirector', () => {
  it('starts one looping BGM only after a gesture', () => {
    const { created, director } = harness();
    expect(created).toHaveLength(0); director.startFromGesture(); director.startFromGesture();
    expect(created).toHaveLength(1); expect(created[0].src).toBe('/bgm.ogg'); expect(created[0].loop).toBe(true);
  });

  it('restores and persists independent clamped settings', () => {
    const saved = storage({ 'chessSummon.audio.v1': JSON.stringify({ bgmVolume: 0.3, sfxVolume: 0.7, muted: true }) });
    const { director } = harness({ storage: saved });
    expect(director.settings).toEqual({ bgmVolume: 0.3, sfxVolume: 0.7, muted: true });
    director.setBgmVolume(9); director.setSfxVolume(-2); director.setMuted(false);
    expect(JSON.parse(saved.getItem('chessSummon.audio.v1'))).toEqual({ bgmVolume: 1, sfxVolume: 0, muted: false });
  });

  it('applies SFX gain exactly once and bounds voices', () => {
    const { created, director } = harness({ maxSfx: 2 });
    director.setSfxVolume(0.6); director.playCue('ui'); director.playCue('action'); director.playCue('ui');
    expect(created[0].volume).toBeCloseTo(0.3); expect(created[0].pause).toHaveBeenCalledOnce();
    expect(director.activeSfx).toHaveLength(2);
  });

  it('ducks danger for one second and restores', () => {
    const { created, director, advance } = harness();
    director.setBgmVolume(0.8); director.startFromGesture(); director.playCue('danger');
    expect(created[0].volume).toBeCloseTo(0.8 * DUCK_FACTOR);
    advance(999); expect(created[0].volume).toBeCloseTo(0.8 * DUCK_FACTOR);
    advance(1); expect(created[0].volume).toBeCloseTo(0.8);
  });

  it('extends ducking to decoded duration without shortening overlap', () => {
    const { created, director, advance } = harness();
    director.startFromGesture(); director.playCue('danger');
    created[1].duration = 2.5; created[1].emit('loadedmetadata');
    advance(1000); director.playCue('result'); advance(1499);
    expect(created[0].volume).toBeCloseTo(0.24 * DUCK_FACTOR);
    advance(1); expect(created[0].volume).toBeCloseTo(0.24);
  });

  it('pauses and resumes BGM with document visibility', () => {
    const { created, director } = harness();
    director.handleVisibility(false); expect(created).toHaveLength(0);
    director.startFromGesture(); director.handleVisibility(true); director.handleVisibility(false);
    expect(created[0].pause).toHaveBeenCalledOnce(); expect(created[0].play).toHaveBeenCalledTimes(2);
  });

  it('handles missing and failed playback without throwing', () => {
    const { director } = harness();
    expect(director.playCue('missing')).toBe(false);
    const failed = harness({ audioFactory: () => { throw new Error('unavailable'); } }).director;
    expect(() => failed.playCue('ui')).not.toThrow(); expect(failed.playCue('ui')).toBe(false);
  });
});
