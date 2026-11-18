'use strict';

// Global behavior dials. 1 = generated baseline. Reload the page after editing,
// then run `node tools/audit-enemies.js` to re-check all 900 foes.
window.RUNESTACK_ENEMY_TUNING = {
  speed: 1,      // higher = faster falling pieces
  think: 1,      // higher = faster decisions
  hold: 1,       // higher = more frequent holds
  skill: 1,      // higher = better placements
  aggression: 1  // higher = more hard drops and pressure
};

// Per-enemy overrides. The key is the 1-based roster position (FOE 001..900).
// `strategy` changes placement priorities and the displayed behavior label.
// Numeric fields replace the generated value directly. Re-run the audit after edits.
//
// Example:
// 41: { strategy: 'SAFE', skill: .95, dropMs: 520, thinkMs: 260, moveMs: 240, holdChance: .5 },
// 858: { strategy: 'RUSHER', skill: .74, dropMs: 368, thinkMs: 239, moveMs: 90, hardDrop: .62 }
window.RUNESTACK_ENEMY_OVERRIDES = {};
