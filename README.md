# Stackbound — card game testing prototype

## Play locally
Run a local web server in this folder (ES modules require HTTP, not file://):

```bash
python -m http.server 8000
```

Open http://localhost:8000 and select **Quick-start AI game** to play immediately. To experience the open, alternating draft, choose **New game**. You can test 20, 30 or 40 card decks and single-exchange or fight-to-death combat. The AI is a simple baseline heuristic, not a trained opponent.

## Deploy to GitHub Pages
Commit the **contents** of this folder to your GitHub repository root (or a subfolder used as Pages root). In Settings > Pages, select Deploy from branch. The app works against AI without Firebase.

## Firebase multiplayer setup
1. Create a Firebase project and register a Web app.
2. Enable Authentication > Sign-in method > Anonymous.
3. Create Cloud Firestore.
4. In Firestore Rules, use the **testing-only** example in the app's Multiplayer tab. Do not use these permissive rules for public/competitive deployment.
5. Host the app over HTTPS (e.g., GitHub Pages). Both players open it, paste the same Firebase config JSON, and click Connect.
6. Host creates a room, shares the room ID, and guest joins. Alternating drafting and gameplay are synchronized via Firestore transactions.

Firebase config is intentionally NOT stored in the source code. The project uses the official Firebase CDN modules and doesn't need a build step. **Security limitation:** Firestore documents contain both hands and the entire deck; knowledgeable players can inspect them, and these demo rules do not validate legal moves. For a public release, use server-authoritative Cloud Functions, strict rules, per-player hidden data and validated transactions.

## Prototype assumptions and known limitations
- Only the 15 base soldier designs are used; multiple copies are allowed. 15 modifier designs (+1 through +5 to one stat) can attach to soldiers and stack.
- Modifier cost is an **unvalidated placeholder**: ceil(bonus/2). Utility exceptions (redirect, bypass guard, extra attacks) are not yet implemented.
- Hero max HP is number of surviving soldiers; start-of-turn hero HP and soldier defense restore. No independent +1 HP is used.
- If the deck empties, flip pile becomes the next deck with the last spent card on top. Cards remain in hand across turns, with refill to 7.
- There is no hand limit beyond the 7-card draw target; no auto-discard. Soldiers and modifiers leave the deck cycle while deployed/attached.
- When a soldier dies, attached modifiers return to flip pile; this is provisional.
- The AI drafts predictable decks and plays basic attacks and cards. It is meant for manual playtesting, **not balance conclusions**.
- The Balance Lab also runs seeded AI-vs-AI batches of 20–500 full games with randomized decks. The Balance Lab can export 16,200 matchup records (15×15×2 initiation states×3 stats×6 bonuses×2 modes). For all mixed-stat combinations use the previously generated comprehensive CSV.
- Multiplayer assumes a single room has exactly two players. The host must create a fresh room for a new game. There is no reconnect identity beyond Firebase anonymous auth persistence.

## Files
- `index.html`, `style.css`: interface
- `engine.js`: deterministic drafting, card economy, combat and basic AI
- `app.js`: UI, local game and multiplayer integration
- `firebase.js`: optional Firestore adapter
- `balance/`: prior balance ledger and comprehensive matchup data

## Testing checklist
- Quick-start, deploy a soldier, attack a soldier, end turn, verify recovery.
- Play a modifier with selected payment cards and friendly target.
- Draft a full deck in alternating order and verify no shuffle.
- Empty the deck and verify last currency card returns first.
- Repeat in both combat modes.
- Test a host and guest in separate browsers before inviting testers.
