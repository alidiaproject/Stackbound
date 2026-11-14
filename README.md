# Stackbound v0.2 — Expanded Card & Simulation Prototype

Open `index.html` through GitHub Pages or a local HTTP server. For GitHub Pages, upload **all files in this ZIP** to the repository root, enable Pages from Settings → Pages, and select `main` / root. Opening index.html via file:// may block ES modules.

## Contents
- **151 card definitions:** 15 original common soldiers, 60 rarity variants, 15 numeric modifiers, 15 named attachments, 24 actions, 12 traps, and 10 environments.
- Two combat modes, deterministic deck stacking, payment ordering, flip recycling, AI play, local play, optional Firebase room code, and Balance Lab.
- `balance/simulation_v02.json`: 12,000 automated matches across deck sizes 20/30/40, combat modes, and two seeds.
- `simulate.mjs`: reproducible simulation script (requires Node.js 20+). Run `node simulate.mjs`.
- `test-engine.mjs`: smoke tests. Run `node test-engine.mjs`.

## Important prototype assumptions
The 60 rarity variants use a **provisional** +1/+2/+3/+4 bonus to their archetype's favored stat, at the original card cost. They do not yet implement individually distinct special abilities. This is deliberately a stress-test mechanic, not a claim of balance. Cost is the number of **other** cards discarded to play a card. Some action buffs are represented as persistent attachments; traps trigger automatically rather than being player-timed reactions. The 15 original base soldier stat lines remain unchanged.

The simulation AI is heuristic, not an optimal player. Its randomized decks are NOT legal competitive decklists yet because deck construction restrictions are not finalized. Win rates reflect that AI policy and randomized deck composition, not true card balance. Review the results before using rarity variants in competitive play.

## Firebase
Open Multiplayer and supply your own Firebase web config; enable Anonymous Auth and Firestore. Room data contains both players' hands and deck order. Firestore rules in the interface are only for trusted prototype testing and are **not secure for public competitive use**. Never store secret service-account keys in GitHub.

## v0.3 correction — hero hit counters
- Direct soldier attacks deal **exactly 1 hero HP**, regardless of Attack. Trap shields may block that hit.
- Soldier-vs-soldier damage still uses the Attack stat.
- Action-card direct hero damage (Ion Cannon, etc.) is unchanged **pending a design decision**; these effects can currently cause multi-HP losses.
- `test-hero.mjs` is a regression test for this correction.
- `test-new-sim.mjs` and `balance/corrected_hero_simulation.json` contain the new **180-match diagnostic** (30 per mode/deck size) with a 400-action observation cutoff. Unresolved games are **not draws**; the AI may be cycling or matches may simply need more actions. The mean of completed games excludes unresolved matches and is NOT an unbiased estimate of all game durations.
- Previous v0.2 full-game simulation statistics are **obsolete** under this correction. Old balance files are retained only as historical artifacts and must not be cited as corrected results.
- The default simulation helper still has a 30,000-action safety cap to prevent unbounded execution; the game itself has no sudden-death rule.

## v0.4 — Reinforcement recovery
- **Hero hit counters immediately restore to maximum when a soldier is deployed.** No automatic hero recovery at turn start.
- Soldier defense still restores at the beginning of its owner's turn. Losing a soldier still reduces maximum hero hit counters.
- `test-recovery.mjs` validates both changes. `balance/corrected_hero_simulation.json` contains 180 new games (30 per configuration, 400-action diagnostic cap).
- `balance/replayed_unresolved.json` replays all **59** previously unresolved v0.3 games with the new rule: 58 ended with a winner within 224 actions; 1 remained unresolved at 1,500 actions. The old scenarios are identified by their original seeds and match indices.
- **Important:** An unresolved match can still occur due to AI or card-economy behavior; this rule greatly reduces stalls but does not guarantee a winner. The action cards' direct hero damage is still provisional.

## v0.5.0 — tabletop UI refresh
- New Hearthstone-inspired tabletop layout with opposing field, central turn controls, friendly field and hand.
- Distinct framed cards with original CSS-generated mechanical-sphere placeholder artwork, cost gems, stat readouts and card-type art colors.
- Visible build label `v0.5.0 · UI refresh` in the header, and versioned CSS/JS URLs to help bust browser caches after GitHub Pages deploys.
- Corrected in-app rules description: hero HP is restored immediately on soldier deployment; direct soldier hits always deal one hero HP.
- Gameplay engine, AI, and Firebase scaffolding carried forward from v0.4; this is a presentation-focused patch.
