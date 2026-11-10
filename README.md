# Nest Egg

**Your first paycheck. Your first plan.** A three-tab interactive mock website for a Principles of Management / Shark Tank class concept.

## Experience

- **My Plan**: an adjustable paycheck/goal calculator, with a $1,200 apartment-deposit example.
- **Start Here**: a first-job YouTube lesson placeholder, practical starting steps, and a short “pay yourself first” lesson.
- **My Progress**: shared goal state, learning/planning checkpoints, manual savings check-ins, and undo.

Every tab reads the same in-memory demo state. Planned contributions never count as savings. Reloading or choosing **Reset demo** restores the sample; nothing is sent to a backend or stored persistently.

Alex is a fictional 19-year-old Elon University student. Select the user avatar to open the student profile: the illustrative $18.99/month standard price is crossed out beside a $0/month Student membership. Student verification is explicitly a demo; there is no checkout or real university verification. The profile supports Escape, outside-click dismissal, and keyboard focus.

## Visual direction

The interface adapts the member-dashboard patterns of the SoFi reference: a teal dashboard surface, white rounded cards, restrained navigation, compact quick actions, a warm off-white page background, and purple student-membership accents. Nest Egg keeps its own original brand and fictional student experience. The public source contains no real account balances, personal account details, authenticated screenshots, proprietary font files, or SoFi product offers. `theme.css` holds this visual layer; the planner behavior remains in `app.js` and `model.js`.

## Add the YouTube video

Edit **`config.js`**:

```js
export const YOUTUBE_URL = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID';
```

Use a real 11-character video ID. Supported HTTPS formats are `youtube.com/watch?v=…`, `youtube.com/shorts/…`, `youtube.com/embed/…`, and `youtu.be/…`. An empty or invalid URL keeps the intentional placeholder. A valid URL exposes an external YouTube link and a click-to-load privacy-enhanced player. No YouTube requests are made before the player is loaded. This lesson is **separate from the pitch deck's future one-minute marketing video**.

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
