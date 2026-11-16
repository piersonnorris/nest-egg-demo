// Guided 3-step walkthrough shown every time the site loads.
// Mirrors the pitch deck's "A personal plan in three steps" slide.
// Add ?tour=0 to the URL to open the site without the walkthrough (handy while editing).

const STEPS = [
  {
    number: 1,
    label: 'Set a goal',
    tab: 'plan',
    target: '.goal-card',
    title: 'Start with a goal',
    body: 'Alex is saving $1,200 for a first place fund. Pick a goal and a paycheck, and Nest Egg shows how far along you are.'
  },
  {
    number: 2,
    label: 'Learn',
    tab: 'start',
    target: '#video-card',
    title: 'Learn a little first',
    body: 'A short paycheck-routine video and a “pay yourself first” lesson help you choose an amount you can actually keep up.'
  },
  {
    number: 3,
    label: 'Follow the plan',
    tab: 'plan',
    target: '.contribution-card',
    title: 'Follow the plan',
    body: 'Choose an amount per paycheck and see how many paychecks to your goal. Your next action: set it aside at your own bank.'
  }
];

const params = new URLSearchParams(location.search);
if (params.get('tour') !== '0') startTour();

function startTour() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const previousFocus = document.activeElement;
  let index = 0;

  const root = document.createElement('div');
  root.className = 'tour';
  root.innerHTML = `
    <div class="tour-spot" aria-hidden="true"></div>
    <button type="button" class="tour-skip" aria-label="Skip the walkthrough">Skip <span aria-hidden="true">✕</span></button>
    <section class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-body">
      <p class="tour-kicker"></p>
      <h2 id="tour-title"></h2>
      <p id="tour-body"></p>
      <div class="tour-dots" aria-hidden="true">${STEPS.map(() => '<i></i>').join('')}</div>
      <div class="tour-actions">
        <button type="button" class="tour-back">Back</button>
        <button type="button" class="tour-next"></button>
      </div>
    </section>`;
  document.body.append(root);
  document.documentElement.classList.add('tour-open');

  const spot = root.querySelector('.tour-spot');
  const card = root.querySelector('.tour-card');
  const kicker = root.querySelector('.tour-kicker');
  const title = root.querySelector('#tour-title');
  const body = root.querySelector('#tour-body');
  const dots = [...root.querySelectorAll('.tour-dots i')];
  const back = root.querySelector('.tour-back');
  const next = root.querySelector('.tour-next');
  const skip = root.querySelector('.tour-skip');

  function currentTarget() { return document.querySelector(STEPS[index].target); }

  function place() {
    const el = currentTarget();
    if (!el) return;
    const pad = 10;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = el.getBoundingClientRect();
    const top = Math.max(8, rect.top - pad);
    const left = Math.max(8, rect.left - pad);
    const right = Math.min(vw - 8, rect.right + pad);
    const bottom = Math.min(vh - 8, rect.bottom + pad);
    Object.assign(spot.style, { top: `${top}px`, left: `${left}px`, width: `${Math.max(0, right - left)}px`, height: `${Math.max(0, bottom - top)}px` });

    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    const gap = 18;
    let x;
    let y;
    if (vw < 720) {
      // Small screens: bottom sheet, centered.
      x = (vw - cw) / 2;
      y = vh - ch - 14;
    } else if (right + gap + cw <= vw - 12) {
      x = right + gap; y = Math.min(Math.max(top, 84), vh - ch - 14);
    } else if (left - gap - cw >= 12) {
      x = left - gap - cw; y = Math.min(Math.max(top, 84), vh - ch - 14);
    } else if (bottom + gap + ch <= vh - 12) {
      x = Math.min(Math.max(left, 12), vw - cw - 12); y = bottom + gap;
    } else if (top - gap - ch >= 12) {
      x = Math.min(Math.max(left, 12), vw - cw - 12); y = top - gap - ch;
    } else {
      // Target fills the screen: float the card over its lower-right corner.
      x = vw - cw - 20; y = vh - ch - 20;
    }
    card.style.left = `${Math.round(x)}px`;
    card.style.top = `${Math.round(y)}px`;
  }

  function show(i, moveFocus = true) {
    index = i;
    const step = STEPS[i];
    const tab = document.getElementById(`tab-${step.tab}`);
    if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();
    kicker.textContent = `Step ${step.number} of ${STEPS.length} · ${step.label}`;
    title.textContent = step.title;
    body.textContent = step.body;
    dots.forEach((dot, n) => dot.classList.toggle('on', n === i));
    back.hidden = i === 0;
    next.textContent = i === STEPS.length - 1 ? 'Start exploring' : 'Next';
    root.classList.add('tour-moving');
    const el = currentTarget();
    if (el) {
      const rect = el.getBoundingClientRect();
      const offset = window.innerWidth < 720 ? 110 : 96;
      window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - offset), behavior: 'instant' });
    }
    // Wait a frame for the tab panel to lay out before measuring.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      place();
      root.classList.remove('tour-moving');
      if (moveFocus) next.focus({ preventScroll: true });
    }));
  }

  function finish() {
    window.removeEventListener('resize', place);
    window.removeEventListener('scroll', place);
    document.removeEventListener('keydown', onKey, true);
    root.remove();
    document.documentElement.classList.remove('tour-open');
    const plan = document.getElementById('tab-plan');
    if (plan && plan.getAttribute('aria-selected') !== 'true') plan.click();
    window.scrollTo({ top: 0, behavior: 'instant' });
    (document.querySelector('#plan h1') || previousFocus)?.focus?.({ preventScroll: true });
  }

  function onKey(event) {
    if (event.key === 'Escape') { event.preventDefault(); finish(); return; }
    if (event.key === 'ArrowRight') { event.preventDefault(); next.click(); return; }
    if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); back.click(); return; }
    if (event.key === 'Tab') {
      // Keep keyboard focus inside the walkthrough.
      const focusable = [skip, ...(back.hidden ? [] : [back]), next];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      else if (!focusable.includes(document.activeElement)) { event.preventDefault(); next.focus(); }
    }
  }

  next.addEventListener('click', () => { if (index === STEPS.length - 1) finish(); else show(index + 1); });
  back.addEventListener('click', () => show(index - 1));
  skip.addEventListener('click', finish);
  document.addEventListener('keydown', onKey, true);
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, { passive: true });
  if (reduceMotion) root.classList.add('tour-reduced');

  // Always begin on My Plan so step 1 matches what people see after scanning.
  show(0);
}
