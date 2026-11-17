# Enemy balance

RuneStack generates 900 enemies across 11 tiers. Every enemy is scored from 0 to 100
using its speed, reaction time, aggression, hold use, durability, defense, damage,
magic, placement skill and tier.

## Audit all 900 enemies

```bash
node tools/audit-enemies.js
```

The audit prints tier averages, difficulty bands, behavior counts, the largest
outliers and pass/fail checks. It exits with code 1 if a check fails.

Useful views:

```bash
node tools/audit-enemies.js --tier=11        # every Champion-tier foe
node tools/audit-enemies.js --index=858     # one specific foe (1-based)
node tools/audit-enemies.js --overrides     # only hand-tuned foes
node tools/audit-enemies.js --json          # full report for all 900
```

## Difficulty labels

| Score | Label |
| --- | --- |
| 0–25 | TRIVIAL |
| 26–37 | EASY |
| 38–49 | FAIR |
| 50–61 | TOUGH |
| 62–73 | HARD |
| 74–84 | ELITE |
| 85–100 | NIGHTMARE |

The score is weighted toward raw speed and damage, then reaction time, durability,
defense, placement skill and magic. The in-game enemy header shows the score, label
and behavior; hover it for the full breakdown.

## Tune behavior globally

Edit `enemy-tuning.js`:

```js
window.RUNESTACK_ENEMY_TUNING = {
  speed: 1,      // falling speed
  think: 1,      // decision speed
  hold: 1,       // hold frequency
  skill: 1,      // placement quality
  aggression: 1  // hard drops and pressure
};
```

Values are multipliers: `1` is the generated baseline, lower is easier, higher is
harder. Reload the page after editing.

## Tune one enemy

Add an entry keyed by roster position in `enemy-tuning.js`:

```js
window.RUNESTACK_ENEMY_OVERRIDES = {
  858: { strategy: 'SAFE', skill: .95, dropMs: 520, thinkMs: 260, holdChance: .5 },
  859: { strategy: 'RUSHER', hp: 700, attackDamage: 32, defense: 40 }
};
```

Supported fields:

- `strategy`: `TIDY`, `EDGE`, `CENTER_GAP`, `AGGRESSIVE`, `SAFE`, `WELL`, `CHAOTIC`, `BALANCED`
- `dropMs`, `thinkMs`: falling and decision intervals in milliseconds
- `holdChance`, `hardDrop`, `skill`: values from 0 to 1
- `hp`, `attack`, `defense`, `attackDamage`: direct stat replacements

After editing, run `node tools/audit-enemies.js --overrides` and the full audit.

## Behavior profiles

| Strategy | Label | Play style |
| --- | --- | --- |
| `TIDY` | ARCHITECT | Avoids holes, keeps the stack flat |
| `EDGE` | EDGE-LORD | Prefers edges and clean sides |
| `CENTER_GAP` | WELLKEEPER | Builds around the center |
| `AGGRESSIVE` | RUSHER | Favors clears and hard drops |
| `SAFE` | SENTINEL | Avoids height and risky stacks |
| `WELL` | TRAPPER | Sets up wells |
| `CHAOTIC` | WILDCARD | Unpredictable placements |
| `BALANCED` | DUELIST | General-purpose play |

## Browser checks

Open the game console:

```js
RuneStackAudit()        // full report
RuneStackEnemy(858)     // one foe with score breakdown
RuneStackTuning         // active global dials
RuneStackBehaviors      // behavior profiles
RuneStackOverrides      // active per-enemy overrides
```
