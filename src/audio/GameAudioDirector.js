const CUE_NAMES = ['ui', 'action', 'danger', 'transition', 'result'];
const CUE_GAIN = { ui: 0.45, action: 1, danger: 1, transition: 0.8, result: 1 };
export const DUCK_FACTOR = 0.55;
const MIN_DUCK_MS = { danger: 1000, result: 800 };

function clamp01(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export class GameAudioDirector {
  constructor({ audioFactory, cues, bgmUrl, storage = globalThis.localStorage, storageKey = 'chessSummon.audio.v1', maxSfx = 8, now = () => performance.now(), setTimer = setTimeout, clearTimer = clearTimeout }) {
    this.audioFactory = audioFactory;
    this.cues = {};
    for (const name of CUE_NAMES) if (cues?.[name]) this.cues[name] = cues[name];
    this.bgmUrl = bgmUrl;
    this.storage = storage;
    this.storageKey = storageKey;
    this.maxSfx = Math.max(1, maxSfx);
    this.now = now;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    const saved = this.restoreSettings();
    this.bgmVolume = saved.bgmVolume;
    this.sfxVolume = saved.sfxVolume;
    this.muted = saved.muted;
    this.bgm = null;
    this.gestureStarted = false;
    this.activeSfx = [];
    this.duckDeadline = 0;
    this.duckTimer = null;
    this.lastError = null;
  }

  restoreSettings() {
    const defaults = { bgmVolume: 0.24, sfxVolume: 0.62, muted: false };
    try {
      const saved = JSON.parse(this.storage?.getItem(this.storageKey) || 'null');
      if (!saved) return defaults;
      return { bgmVolume: clamp01(saved.bgmVolume), sfxVolume: clamp01(saved.sfxVolume), muted: saved.muted === true };
    } catch { return defaults; }
  }

  persist() {
    try { this.storage?.setItem(this.storageKey, JSON.stringify(this.settings)); }
    catch (error) { this.lastError = error; }
  }

  safePlay(audio, onError) {
    try {
      const result = audio.play?.();
      if (result?.catch) result.catch((error) => { this.lastError = error; onError?.(); });
    } catch (error) { this.lastError = error; onError?.(); }
  }

  startFromGesture() {
    this.gestureStarted = true;
    if (!this.bgmUrl) return false;
    if (!this.bgm) {
      try { this.bgm = this.audioFactory(this.bgmUrl); }
      catch (error) { this.lastError = error; return false; }
      if (!this.bgm) return false;
      this.bgm.src = this.bgmUrl;
      this.bgm.loop = true;
    }
    this.applyBgmVolume();
    if (this.bgm.paused !== false) this.safePlay(this.bgm);
    return true;
  }

  playCue(nameOrCue) {
    let cue = typeof nameOrCue === 'string' ? this.cues[nameOrCue] : nameOrCue;
    if (typeof cue === 'string') cue = { src: cue, category: nameOrCue };
    if (!cue?.src) return false;
    const category = cue.category || (typeof nameOrCue === 'string' ? nameOrCue : 'action');
    const gain = cue.gain ?? cue.volume ?? CUE_GAIN[category] ?? 1;
    if (this.activeSfx.length >= this.maxSfx) {
      const oldest = this.activeSfx.shift();
      try { oldest?.audio.pause?.(); if (oldest) oldest.audio.currentTime = 0; } catch (error) { this.lastError = error; }
    }
    let sfx;
    try { sfx = this.audioFactory(cue.src); } catch (error) { this.lastError = error; return false; }
    if (!sfx) return false;
    sfx.src = cue.src;
    sfx.loop = false;
    sfx.volume = this.muted ? 0 : clamp01(this.sfxVolume * gain);
    const entry = { audio: sfx, gain };
    this.activeSfx.push(entry);
    const cleanup = () => { const index = this.activeSfx.indexOf(entry); if (index >= 0) this.activeSfx.splice(index, 1); };
    sfx.addEventListener?.('ended', cleanup, { once: true });
    sfx.addEventListener?.('error', cleanup, { once: true });
    if (MIN_DUCK_MS[category]) {
      const extend = () => {
        const duration = Number.isFinite(sfx.duration) ? sfx.duration * 1000 : 0;
        this.extendDuck(this.now() + Math.max(MIN_DUCK_MS[category], duration));
      };
      extend();
      if (!Number.isFinite(sfx.duration)) sfx.addEventListener?.('loadedmetadata', extend, { once: true });
    }
    this.safePlay(sfx, cleanup);
    return true;
  }

  extendDuck(deadline) {
    if (deadline <= this.duckDeadline) return;
    this.duckDeadline = deadline;
    this.applyBgmVolume();
    if (this.duckTimer !== null) this.clearTimer(this.duckTimer);
    this.duckTimer = this.setTimer(() => { this.duckTimer = null; this.applyBgmVolume(); }, Math.max(0, deadline - this.now()));
  }

  handleVisibility(hidden) {
    if (hidden) { try { this.bgm?.pause?.(); } catch (error) { this.lastError = error; } }
    else if (this.gestureStarted && !this.muted && this.bgm?.paused) this.safePlay(this.bgm);
  }

  setBgmVolume(value) { this.bgmVolume = clamp01(value); this.persist(); this.applyBgmVolume(); }
  setSfxVolume(value) { this.sfxVolume = clamp01(value); this.persist(); for (const item of this.activeSfx) item.audio.volume = this.muted ? 0 : clamp01(this.sfxVolume * item.gain); }
  setMuted(value) { this.muted = !!value; this.persist(); this.applyBgmVolume(); this.setSfxVolume(this.sfxVolume); }
  applyBgmVolume() { if (this.bgm) this.bgm.volume = this.muted ? 0 : this.bgmVolume * (this.now() < this.duckDeadline ? DUCK_FACTOR : 1); }
  stopBgm() { if (this.bgm) { this.bgm.pause(); this.bgm.currentTime = 0; } }
  get settings() { return { bgmVolume: this.bgmVolume, sfxVolume: this.sfxVolume, muted: this.muted }; }
}
