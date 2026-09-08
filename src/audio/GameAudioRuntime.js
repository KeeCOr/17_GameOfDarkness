import { GameAudioDirector } from './GameAudioDirector.js';

export function installGameAudioRuntime(basePath, bgmFile = 'bgm-loop.ogg') {
  if (globalThis.__gameAudioRuntime) return globalThis.__gameAudioRuntime;
  const director = new GameAudioDirector({
    audioFactory: () => new Audio(),
    bgmUrl: `${basePath}/${bgmFile}`,
    cues: {
      ui: { src: '/assets/audio/kenney/piece-select.ogg', category: 'ui', gain: 0.28 },
      action: { src: '/assets/audio/kenney/move-confirm.ogg', category: 'action', gain: 0.32 },
      danger: { src: '/assets/audio/kenney/capture.ogg', category: 'danger', gain: 0.42 },
      transition: { src: '/assets/audio/kenney/summon-confirm.ogg', category: 'transition', gain: 0.36 },
      result: { src: '/assets/audio/kenney/victory.ogg', category: 'result', gain: 0.48 },
    },
  });
  const start = () => director.startFromGesture();
  window.addEventListener('pointerdown', start, { once: true });
  window.addEventListener('keydown', start, { once: true });
  document.addEventListener('visibilitychange', () => director.handleVisibility(document.hidden));
  window.addEventListener('game-audio', (event) => {
    if (event.detail?.cue) director.playCue(event.detail.cue);
  });
  globalThis.__gameAudioRuntime = director;
  return director;
}

export function emitGameAudioCue(cue) {
  window.dispatchEvent(new CustomEvent('game-audio', { detail: { cue } }));
}
