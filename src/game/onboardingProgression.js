export function getOnboardingRules(step = 0) {
  const stages = [
    { title: 'Protect the king', pieces: ['king', 'pawn'], rules: ['move', 'capture'] },
    { title: 'Add a knight', pieces: ['king', 'pawn', 'knight'], rules: ['move', 'capture', 'threat'] },
    { title: 'Learn summoning', pieces: ['king', 'pawn', 'knight'], rules: ['move', 'capture', 'threat', 'summon', 'mana'] },
  ];
  return stages[Math.min(stages.length - 1, Math.max(0, Number(step) || 0))];
}

export function compareBoardPressure({ before = {}, after = {} } = {}) {
  const controlDelta = (Number(after.control) || 0) - (Number(before.control) || 0);
  const kingThreatDelta = (Number(after.kingThreat) || 0) - (Number(before.kingThreat) || 0);
  return {
    controlDelta,
    kingThreatDelta,
    summary: `Control ${signed(controlDelta)} | King threat ${signed(kingThreatDelta)}`,
  };
}

function signed(value) {
  return value >= 0 ? `+${value}` : String(value);
}
