# Nest Egg version history

This history names the classroom website releases. Earlier development commits remain in Git. Release dates are publication dates; the fictional presentation timeline stays December 1, 2026.

## [1.1] — 2026-11-10

### Changed

- Replaced the visible YouTube thumbnail with an original navy/teal Nest Egg lesson cover, a clear play button, and a purple student badge.
- Video loads only after Play, in an accessible native dialog. Close or Escape removes the player, stops playback, and returns focus to Play. The external YouTube link remains available.
- Separated **$700 total saved**, **$100/month historical average**, and **$75 planned for the next payday**. The percentage explicitly refers to the $300 paycheck; projections state that repeating the planned amount is an assumption.
- Added a comparable monthly equivalent for a repeated biweekly plan and identified the smaller final contribution ($50 in the default example).
- Added a book-icon **Savings log** from My Plan and My Progress: seven $100 monthly entries, a running balance, and separate new manual check-ins. Undo removes only the latest manual check-in.
- Custom starting balances replace the original monthly history with an adjusted opening balance and no claimed monthly average. Reset restores the complete example.
- Added a collapsed **Why Nest Egg + SoFi?** section with the proposed Learn → Plan → Build a habit → optional adult SoFi path, source attribution, and pilot measures framed as proposals.
- Updated lesson amounts to follow the active plan rather than keeping hardcoded $75/$300 copy after edits.
- Added the on-site version/release link, Git tags, GitHub releases, and this changelog.

### Preserved

- Three tabs; original Nest Egg mark; teal dashboard, white cards, and student membership styling.
- Fictional Alex, 19, Elon University; illustrative $18.99/month crossed out beside $0/month Student access.
- Fixed demo: December 1, 2026; November 20 already paid; December 4 next payday.
- Exact requested video title and link. This is separate from the pitch deck's future marketing video.
- No bank connection, actual transfers, persistent account storage, or claim of SoFi endorsement.

### Review and verification

- Claude and Gemini were both consulted for design guidance; accepted and rejected suggestions are recorded in [the review notes](docs/REVIEW-v1.1.md).
- Calculation/ledger tests cover the historical average, check-ins, undo, custom balances, and fixed payday timeline. Browser review covers playback, dialogs, focus restoration, responsive layouts, and shared state.

## [1.0] — 2026-11-10

Named baseline at commit `c65d3724830155bf8611b32a303152efe9ce4bd6`, preserving the site as it existed before the v1.1 redesign.

- Three-tab paycheck planning, learning, and savings-progress demo.
- Elon student profile with illustrative $18.99 → $0 membership.
- SoFi-inspired teal/white dashboard and original Nest Egg identity.
- December 1 presentation timeline, November 20 paid, December 4 next payday.
- $700 saved from seven monthly $100 contributions, $1,200 goal, $300 paycheck, and $75 future contribution.
- Requested YouTube video embedded with its original thumbnail.
- Manual savings check-ins, undo, reset, input validation, and mobile layouts.

[1.1]: https://github.com/piersonnorris/nest-egg-demo/releases/tag/v1.1
[1.0]: https://github.com/piersonnorris/nest-egg-demo/releases/tag/v1.0
