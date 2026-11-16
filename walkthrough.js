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
  },
  {
    number: 4,
    label: 'What to do',
    tab: 'plan',
    target: null,
    title: 'What to do',
    body: "It's free for students. No real money moves. The demo resets when you reload. Try changing the amount per paycheck."
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

  function currentTarget() { return STEPS[index].target ? document.querySelector(STEPS[index].target) : null; }

  const isPhone = () => window.innerWidth < 720;

  // Bottom of the sticky site header, so a scrolled-to section is never hidden under it.
  function headerBottom() {
    const header = document.querySelector('header');
    return header ? header.getBoundingClientRect().bottom : 0;
  }

  // Scroll the target so it sits just below the sticky header (phones) or comfortably in view (desktop).
  function scrollToTarget() {
    const el = currentTarget();
    if (!el) return;
    const offset = isPhone() ? Math.max(headerBottom(), 0) + 12 : 96;
    window.scrollTo({ top: Math.max(0, window.scrollY + el.getBoundingClientRect().top - offset), behavior: 'instant' });
  }

  function place() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    if (!STEPS[index].target) {
      // No target: hide the spotlight and center the card in the viewport.
      spot.style.display = 'none';
      card.style.bottom = 'auto';
      card.style.left = `${Math.round((vw - cw) / 2)}px`;
      card.style.top = `${Math.round(Math.max(8, (vh - ch) / 2))}px`;
      return;
    }
    const el = currentTarget();
    if (!el) return;
    spot.style.display = '';
    card.style.bottom = 'auto';
    const pad = 10;
    const rect = el.getBoundingClientRect();
    const top = Math.max(8, rect.top - pad);
    const left = Math.max(8, rect.left - pad);
    const right = Math.min(vw - 8, rect.right + pad);
    let bottom = Math.min(vh - 8, rect.bottom + pad);

    const gap = 18;
    let x;
    let y;
    if (isPhone()) {
      // Phones: a compact bottom sheet that stays clear of the home indicator. The spotlight
      // stops just above the sheet, so the highlighted section is never covered.
      const edge = 12;
      x = (vw - cw) / 2;
      y = vh - ch - edge;
      bottom = Math.max(top + 60, Math.min(bottom, y - 10));
      card.style.bottom = `max(${edge}px, env(safe-area-inset-bottom))`;
      card.style.top = 'auto';
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
    Object.assign(spot.style, { top: `${top}px`, left: `${left}px`, width: `${Math.max(0, right - left)}px`, height: `${Math.max(0, bottom - top)}px` });
    card.style.left = `${Math.round(x)}px`;
    if (!isPhone()) card.style.top = `${Math.round(y)}px`;
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
    // Wait a frame for the tab panel to lay out, then bring the section into view and measure it.
    // A timeout backs up requestAnimationFrame, which browsers pause in background tabs.
    let settled = false;
    const settle = () => {
      if (settled || index !== i) return;
      settled = true;
      scrollToTarget();
      place();
      root.classList.remove('tour-moving');
      // The very first step should appear in place instead of sliding in from the corner.
      if (root.classList.contains('tour-first')) setTimeout(() => root.classList.remove('tour-first'), 60);
      if (moveFocus) next.focus({ preventScroll: true });
    };
    requestAnimationFrame(() => requestAnimationFrame(settle));
    setTimeout(settle, 150);
  }

  // goToAmount: "Start exploring" drops people at the amount-per-paycheck card so they can try it.
  function finish(goToAmount = false) {
    window.removeEventListener('resize', place);
    window.removeEventListener('scroll', place);
    document.removeEventListener('keydown', onKey, true);
    root.remove();
    document.documentElement.classList.remove('tour-open');
    const plan = document.getElementById('tab-plan');
    if (plan && plan.getAttribute('aria-selected') !== 'true') plan.click();
    const amount = goToAmount ? document.querySelector('.contribution-card') : null;
    if (amount) {
      requestAnimationFrame(() => {
        const header = document.querySelector('header');
        const offset = (header ? header.getBoundingClientRect().bottom : 0) + 12;
        window.scrollTo({ top: Math.max(0, window.scrollY + amount.getBoundingClientRect().top - offset), behavior: 'instant' });
      });
      return;
    }
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

  next.addEventListener('click', () => { if (index === STEPS.length - 1) finish(true); else show(index + 1); });
  back.addEventListener('click', () => show(index - 1));
  skip.addEventListener('click', () => finish());

  // Phones: swipe the card left for next, right for back.
  let swipe = null;
  card.addEventListener('touchstart', (event) => {
    const t = event.touches[0];
    swipe = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  card.addEventListener('touchend', (event) => {
    if (!swipe) return;
    const t = event.changedTouches[0];
    const dx = t.clientX - swipe.x;
    const dy = t.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) next.click(); else if (index > 0) back.click();
  }, { passive: true });
  document.addEventListener('keydown', onKey, true);
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, { passive: true });
  if (reduceMotion) root.classList.add('tour-reduced');
  root.classList.add('tour-first');

  // Always begin on My Plan so step 1 matches what people see after scanning.
  show(0);
}
