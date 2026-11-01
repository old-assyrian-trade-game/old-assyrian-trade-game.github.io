# The Assur Caravan — Old Assyrian Trade Game

A classroom trading game set between Assur and Anatolia in 1895 BCE.

Play: https://old-assyrian-trade-game.github.io/

Players need only a browser on a phone, tablet, Mac, or Windows computer.
No installation or account is needed. Each player or team has its own saved season.

## Editing

- `dist/about.html`: introduction, designers, contact, and acknowledgments.
- `dist/rules.js`: editable scenario values.
- `dist/guide.js`: player instructions and route reports.
- `dist/engine.js`: game mechanics and save validation.
- `dist/app.js` and `dist/style.css`: interface, map, and layout.
- `HISTORICAL_NOTES.md`: research and reproducible price-balance comparisons.

Keep commodity and city IDs unchanged. Review the instructions when changing
the rules, increment the scenario version, and start a new game. Saved games
must match the exact scenario.

## Tests and publication

Run `npm test` with Node 22 or newer. No packages need installing.
Run `npm run audit` to reproduce the cargo-strategy comparison.

The GitHub Actions workflow runs the tests and publishes `dist/` only after
they pass. In Settings → Pages, select GitHub Actions as the publishing source.

## Release 2.3.0

- A 7,200-shekel interest-free starting loan.
- At most two successful iron purchases at the Euphrates per season. Declined
  offers do not count; selling, discarding, or losing iron does not reset the limit.
- Revised prices and higher typical textile margins.
- An editable About page with space for introduction, credits, and contact.
- 72 behavioral tests, including 300 seasons with normal risks and 2,400
  controlled price-comparison ventures.

The map and numerical rules are classroom abstractions. No claim is made to
reconstruct a documented ancient trading season. Previous Word handouts
remain separate from this website release.
