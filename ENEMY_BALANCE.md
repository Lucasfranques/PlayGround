# Enemy balance

RuneStack generates 900 enemies across 11 tiers. Every enemy is scored from **0 to
1000** using its falling speed, lateral movement speed, reaction time, aggression,
hold use, durability, defense, damage, magic, placement skill and tier. The in-game
header also shows the score as a percentage (`DIFF 864/1000 · 86.4%`).

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

| Score | Percentage | Label |
| --- | --- | --- |
| 0–259 | 0–25.9% | TRIVIAL |
| 260–379 | 26–37.9% | EASY |
| 380–499 | 38–49.9% | FAIR |
| 500–619 | 50–61.9% | TOUGH |
| 620–739 | 62–73.9% | HARD |
| 740–849 | 74–84.9% | ELITE |
| 850–1000 | 85–100% | NIGHTMARE |

The score is weighted toward raw speed and damage, then reaction time, durability,
defense, placement skill and magic. Lateral mobility now contributes too. Hover the
in-game enemy header for the full breakdown of every component.

## Tier strength and speed

Tier curves are defined in `TIER_POWER` inside `game.js`. Each tier multiplies HP,
attack damage, defense, falling speed, reaction speed and aggression on top of the
base tier scaling. Later tiers also receive faster lateral movement and more spells.

| Tier | Identity | Typical behavior |
| --- | --- | --- |
| 1–3 | Learning tiers | Slow drops, few spells, forgiving damage |
| 4–6 | Midgame | Faster decisions, 1–3 spells, harder drops |
| 7–9 | Advanced | Rapid movement, heavy damage, 3–4 spells |
| 10 | Elite | Near-elite speed and durability |
| 11 | Champion | Extremely fast movement/drops, huge HP, 75% defense on some foes, 4–5 spells, meant for level 90+ |

Champion foes can move two columns per movement tick, receive near-guaranteed hard
drops, and act every 45–70 ms once aligned. The tier selector labels Champion as
**LV 90+** and warns underleveled challengers without blocking the attempt.

## Underlevel ward

A player far below a tier's expected level cannot be deleted by two quick line
clears. Enemy damage is capped at 40% of the player's maximum vitality while the
player is more than 10 levels below `tier × 9`. Champion remains lethal at level 90+
because the ward no longer applies there.

## Choosing a tier

Use **⚔ FOE TIER** in the top bar before a duel to challenge any tier directly,
including the Champion tier. **Auto** keeps normal stage progression. Choosing a
tier replaces the current opponent with a random foe from that tier and keeps all
subsequent victories inside it until Auto is restored.

## Defense caps

Enemy defense is clamped to **75%** for both display and damage calculation, even if
an override or future roster edit asks for more. The player's defense is also capped
at **75%**, and each allocated defense point grants **+0.2%** resistance.

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
- `dropMs`, `thinkMs`, `moveMs`: falling, decision and lateral-movement intervals in milliseconds
- `holdChance`, `hardDrop`, `skill`: values from 0 to 1
- `hp`, `attack`, `defense`, `attackDamage`: direct stat replacements (`attackDamage` caps at 55)

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
RuneStackEnemy(858)     // one foe with score, percentage and breakdown
RuneStackTuning         // active global dials
RuneStackBehaviors      // behavior profiles
RuneStackOverrides      // active per-enemy overrides
```
