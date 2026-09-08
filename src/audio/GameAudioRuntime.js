import { GameAudioDirector } from './GameAudioDirector.js';

export function installGameAudioRuntime(basePath, bgmFile = 'bgm-loop.ogg') {
  if (globalThis.__gameAudioRuntime) return globalThis.__gameAudioRuntime;
  const url = (name) => `${basePath}/${name}.wav`;
  const director = new GameAudioDirector({
    audioFactory: () => new Audio(),
    bgmUrl: `${basePath}/${bgmFile}`,
    cues: { ui: url('sfx-ui'), action: url('sfx-action'), danger: url('sfx-danger'), transition: url('sfx-transition'), result: url('sfx-result') },
  });
  director.setBgmVolume(0.24);
  director.setSfxVolume(0.62);
  const start = () => director.startFromGesture();
  window.addEventListener('pointerdown', start, { once: true });
  window.addEventListener('keydown', start, { once: true });
  window.addEventListener('pointerdown', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button,[data-audio-cue]') : null;
    if (target) director.playCue(target.getAttribute('data-audio-cue') || 'ui');
    else if (event.target instanceof HTMLCanvasElement) director.playCue('action');
  });
  window.addEventListener('keydown', (event) => {
    if (!event.repeat && (event.code === 'Space' || event.code === 'Enter')) director.playCue('action');
  });
  window.addEventListener('game-audio', (event) => {
    if (event.detail?.cue) director.playCue(event.detail.cue);
  });
  globalThis.__gameAudioRuntime = director;
  return director;
}

export function emitGameAudioCue(cue) {
  window.dispatchEvent(new CustomEvent('game-audio', { detail: { cue } }));
}
