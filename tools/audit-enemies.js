#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const gamePath = path.join(__dirname, '..', 'game.js');
const source = fs.readFileSync(gamePath, 'utf8');
const start = source.indexOf('// >>> ROSTER_DATA');
const end = source.indexOf('// <<< ROSTER_DATA');
if (start < 0 || end <= start) throw new Error('Could not find ROSTER_DATA markers in game.js');

const tuningPath = path.join(__dirname, '..', 'enemy-tuning.js');
const sandbox = { console, module: { exports: {} }, window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(tuningPath, 'utf8'), sandbox, { filename: 'enemy-tuning.js' });
vm.runInContext(
  `${source.slice(start, end)}
module.exports={ENEMIES,TIER_COUNTS,ENEMY_TUNING,BEHAVIOR_PROFILES,ENEMY_OVERRIDES,enemyDifficultyProfile,enemyDifficultyLabel,auditEnemyRoster};`,
  sandbox,
  { filename: 'roster-data.js' }
);
const api = sandbox.module.exports;
const report = api.auditEnemyRoster();

const args = process.argv.slice(2);
const valueOf = name => {
  const hit = args.find(arg => arg === name || arg.startsWith(name + '='));
  if (!hit) return null;
  return hit.includes('=') ? hit.split('=').slice(1).join('=') : true;
};

if (args.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const indexArg = valueOf('--index');
if (indexArg) {
  const requested = Number(indexArg);
  const index = Math.max(0, Math.min(api.ENEMIES.length - 1, (Number.isFinite(requested) ? requested : 1) - 1));
  const foe = api.ENEMIES[index];
  const breakdown = api.enemyDifficultyProfile(foe);
  console.log(`#${foe.index + 1} ${foe.name} · Tier ${foe.tier}${foe.hard ? ' · HARD' : ''} · ${foe.behavior}`);
  console.log(`Difficulty: ${breakdown.score}/1000 · ${breakdown.percent.toFixed(1)}% ${api.enemyDifficultyLabel(breakdown.score)}`);
  console.table(Object.fromEntries(Object.entries(breakdown).map(([key, value]) => [key, key === 'score' ? value : Math.round(value * 100)])));
  console.log('Raw enemy stats:', foe);
  process.exit(0);
}

const tierArg = valueOf('--tier');
if (tierArg) {
  const tier = Number(tierArg);
  const rows = report.rows.filter(row => row.tier === tier).sort((a, b) => b.score - a.score);
  if (!rows.length) {
    console.error(`No enemies in tier ${tier}.`);
    process.exit(1);
  }
  console.log(`Tier ${tier}: ${rows.length} enemies · average ${Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length)}/1000`);
  console.table(rows.map(({ index, name, score, percent, label, hard, overridden, dropMs, thinkMs, moveMs, skill, hp, defense, behavior }) => ({ index, name, score, percent: percent.toFixed(1), label, hard, overridden, dropMs, thinkMs, moveMs, skill, hp, defense, behavior })));
  process.exit(0);
}

if (args.includes('--overrides')) {
  console.log(`Enemy overrides: ${report.overrides.length}`);
  if (report.overrides.length) console.table(report.overrides);
  else console.log('No per-enemy overrides configured. Add entries to window.RUNESTACK_ENEMY_OVERRIDES in enemy-tuning.js.');
  process.exit(0);
}

console.log(`RuneStack enemy audit — ${report.total} enemies · 0–1000 scale`);
console.log('\nTiers');
console.table(report.tiers);
console.log('\nDifficulty bands');
console.table(report.bands);
console.log('\nBehavior distribution');
console.table(report.behaviorCounts);
console.log('\nChecks');
for (const check of report.checks) console.log(`${check.pass ? 'PASS' : 'FAIL'}  ${check.name}`);
console.log('\nLargest tier outliers');
console.table(report.outliers.map(({ index, name, tier, score, label, hard, delta, dropMs, thinkMs, moveMs, skill, behavior }) => ({ index, name, tier, score, label, hard, delta, dropMs, thinkMs, moveMs, skill, behavior })));
if (report.checks.some(check => !check.pass)) process.exitCode = 1;
