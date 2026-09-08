export const ACTION_SFX = Object.freeze({
  pieceSelect: Object.freeze({ key: 'kenney-piece-select', path: 'assets/audio/kenney/piece-select.ogg', src: '/assets/audio/kenney/piece-select.ogg', volume: 0.28, category: 'ui' }),
  movePreview: Object.freeze({ key: 'kenney-move-preview', path: 'assets/audio/kenney/move-preview.ogg', src: '/assets/audio/kenney/move-preview.ogg', volume: 0.2, category: 'ui' }),
  moveConfirm: Object.freeze({ key: 'kenney-move-confirm', path: 'assets/audio/kenney/move-confirm.ogg', src: '/assets/audio/kenney/move-confirm.ogg', volume: 0.32, category: 'action' }),
  summonConfirm: Object.freeze({ key: 'kenney-summon-confirm', path: 'assets/audio/kenney/summon-confirm.ogg', src: '/assets/audio/kenney/summon-confirm.ogg', volume: 0.36, category: 'transition' }),
  capture: Object.freeze({ key: 'kenney-capture', path: 'assets/audio/kenney/capture.ogg', src: '/assets/audio/kenney/capture.ogg', volume: 0.42, category: 'danger' }),
  victory: Object.freeze({ key: 'kenney-victory', path: 'assets/audio/kenney/victory.ogg', src: '/assets/audio/kenney/victory.ogg', volume: 0.48, category: 'result' }),
  defeat: Object.freeze({ key: 'kenney-defeat', path: 'assets/audio/kenney/defeat.ogg', src: '/assets/audio/kenney/defeat.ogg', volume: 0.4, category: 'result' }),
});

export function getActionSfxKey(action) {
  if (action === 'piece-select') return 'pieceSelect';
  if (action === 'move-preview') return 'movePreview';
  if (!action || typeof action !== 'object') return null;

  if (action.type === 'summon') return 'summonConfirm';
  if (action.type === 'move') return action.capture ? 'capture' : 'moveConfirm';
  if (action.type === 'game-over') return action.won ? 'victory' : 'defeat';
  return null;
}

export function preloadActionSfx(scene) {
  if (!scene?.load?.audio) return;
  for (const { key, path } of Object.values(ACTION_SFX)) {
    scene.load.audio(key, path);
  }
}

export function playActionSfx(scene, action) {
  const soundKey = getActionSfxKey(action);
  const sound = soundKey ? ACTION_SFX[soundKey] : null;
  if (!sound) return false;
  return globalThis.__gameAudioRuntime?.playCue?.(sound) ?? false;
}
