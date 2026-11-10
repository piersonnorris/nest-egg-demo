# Nest Egg

**Your first paycheck. Your first plan.** A three-tab interactive mock website for a Principles of Management / Shark Tank class concept.

Current version: **1.1**. See [version history](CHANGELOG.md), [GitHub releases](https://github.com/piersonnorris/nest-egg-demo/releases), and [review decisions](docs/REVIEW-v1.1.md). Tag `v1.0` preserves the pre-redesign baseline.

## Experience

- **My Plan**: an adjustable paycheck/goal calculator, with a $1,200 apartment-deposit example, a historical monthly average, and a book-icon savings log. Future contributions are separate from recorded savings.
- **Start Here**: the embedded “Do This EVERY Time You Get Paid (Paycheck Routine)” video, an editable next-payday example, practical starting steps, and a short “pay yourself first” lesson.
- **My Progress**: a seven-month savings history, shared goal state, learning/planning checkpoints, manual savings check-ins, and undo.

The classroom timeline is fixed as of **December 1, 2026**: November 20 is marked paid and December 4 is the next payday. Alex saved $100 in each month from May through November, giving her a $700 starting balance and a $100/month historical average. Her $1,200 goal has $500 remaining: seven future contributions at $75, with the final contribution reduced to $50. New check-ins add to the log without changing the historical average. Editing the starting balance hides the original history/average and shows an adjusted opening balance instead.

Every tab reads the same in-memory demo state. Planned contributions never count as savings. Reloading or choosing **Reset demo** restores the sample; nothing is sent to a backend or stored persistently.

Alex is a fictional 19-year-old Elon University student. Select the user avatar to open the student profile: the illustrative $18.99/month standard price is crossed out beside a $0/month Student membership. Student verification is explicitly a demo; there is no checkout or real university verification. The profile supports Escape, outside-click dismissal, and keyboard focus.

## Visual direction

The interface adapts the member-dashboard patterns of the SoFi reference: a teal dashboard surface, white rounded cards, restrained navigation, compact quick actions, a warm off-white page background, and purple student-membership accents. Nest Egg keeps its own original brand and fictional student experience. The public source contains no real account balances, personal account details, authenticated screenshots, proprietary font files, or SoFi product offers. `theme.css` holds this visual layer; the planner behavior remains in `app.js` and `model.js`.

## Video and presentation timeline

Edit **`config.js`**:

```js
export const YOUTUBE_URL = 'https://youtu.be/IIKr2915l2g?si=8e71qEfb5q15RZMg';
export const YOUTUBE_TITLE = 'Do This EVERY Time You Get Paid (Paycheck Routine)';
export const DEMO_AS_OF = '2026-12-01';
export const LAST_PAYDAY = '2026-11-20';
export const NEXT_PAYDAY = '2026-12-04';
```

Supported HTTPS formats are `youtube.com/watch?v=…`, `youtube.com/shorts/…`, `youtube.com/embed/…`, and `youtu.be/…`. The page initially displays an original Nest Egg cover, without a fetched YouTube thumbnail or iframe. Selecting Play inserts a privacy-enhanced YouTube player in a native dialog and requests playback. Close or Escape removes the iframe and restores focus. Provider controls/content remain unmodified; an external YouTube link is always available. The player may show provider imagery while loading, pausing, or ending. Date edits remain in memory and cannot precede the presentation date. Reset restores December 4. This lesson is **separate from the pitch deck's future one-minute marketing video**.

## Files and local use

The site is plain HTML, CSS, and ES-module JavaScript. There are no dependencies or build step. Serve this folder with any static HTTP server (opening `index.html` directly as a file may block JavaScript modules).

`index.html` contains content and components; `styles.css` controls design and responsive layouts; `app.js` handles interactions; `model.js` contains the money calculations; `assets/nest-egg-mark.svg` is the original student-concept brand treatment. `config.js` is the only place needed to add the video URL.

Run calculation and configuration checks with Node.js:

```sh
npm test
```

## GitHub Pages

Publish the **main** branch at the repository root (`/`) with GitHub Pages. The `.nojekyll` file keeps this a static project. All assets use relative paths, so the project works below a repository URL. See [GitHub's official Pages setup guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Demo boundaries

This is a student-created concept, not a real financial service. Nest Egg is not affiliated with or endorsed by SoFi. The proposal explores financial education and planning for ages 13–25; any future adult financial-product path is optional and 18+ only. Alex, the amounts, and the interface are illustrative. The calculator uses contribution counts without predicting dates, investment returns, or actual transfers. It does not hold funds, sign people up for accounts, or connect to banks.

Only this standalone website source belongs in this public repository. Private course documents, slide speaker notes, personal contact information, private OneDrive links, and credentials are excluded.
