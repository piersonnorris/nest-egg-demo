import { createDemo, summary, moneyToCents, validateDraft, updatePlan, recordSavings, undoSavings, parseYouTubeUrl, isValidPayday } from './model.js?v=4';
import { YOUTUBE_URL, YOUTUBE_TITLE, DEMO_AS_OF, LAST_PAYDAY, NEXT_PAYDAY } from './config.js?v=4';

const $ = id => document.getElementById(id);
const all = selector => [...document.querySelectorAll(selector)];
const money = cents => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:cents % 100 ? 2 : 0}).format(cents / 100);
const asInput = cents => String(cents / 100);
let state = createDemo();
let payday = NEXT_PAYDAY;
const video = parseYouTubeUrl(YOUTUBE_URL);
let toastTimer;
const form = $('plan-form');
const formFields = { goalName:$('goal-name'), target:$('goal-target'), savings:$('starting-savings'), paycheck:$('paycheck'), contribution:$('contribution') };

function notify(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4500);
}

function setError(id, message = '') {
  $(id).textContent = message;
  $(id).hidden = !message;
}

function showTab(name, focus = false) {
  const key = ['plan','start','progress'].includes(name) ? name : 'plan';
  all('.tab').forEach(tab => { const selected = tab.id === `tab-${key}`; tab.classList.toggle('active',selected); tab.setAttribute('aria-selected',String(selected)); tab.tabIndex = selected ? 0 : -1; });
  all('.tab-panel').forEach(panel => { panel.hidden = panel.id !== key; });
  if (key === 'start') mountLessonVideo();
  if (focus) $(key).querySelector('h1').focus({preventScroll:true});
}

function navigate(key, focus = true) {
  if (location.hash === `#${key}`) { showTab(key,focus); return; }
  history.pushState(null,'',`#${key}`);
  showTab(key,focus);
  window.scrollTo({top:0,behavior:'instant'});
}

window.addEventListener('hashchange',() => {
  const key = location.hash.slice(1);
  if (!['plan','start','progress'].includes(key)) history.replaceState(null,'','#plan');
  showTab(key);
  window.scrollTo({top:0,behavior:'instant'});
});
document.querySelector('.skip-link').addEventListener('click',event => {
  event.preventDefault();
  document.querySelector('.tab-panel:not([hidden]) h1').focus();
});
all('svg.icon').forEach(icon => { icon.setAttribute('aria-hidden','true'); icon.setAttribute('focusable','false'); });
all('.tab').forEach(tab => tab.addEventListener('click',event => { event.preventDefault(); navigate(tab.getAttribute('href').slice(1),false); }));
all('[data-navigate]').forEach(link => link.addEventListener('click',event => { event.preventDefault(); navigate(link.dataset.navigate); }));
$('tab-plan').parentElement.addEventListener('keydown',event => {
  const tabs = all('.tab');
  const current = tabs.indexOf(document.activeElement);
  if (current < 0) return;
  let next;
  if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
  else if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = tabs.length - 1;
  else return;
  event.preventDefault();
  tabs[next].focus();
  navigate(tabs[next].getAttribute('href').slice(1),false);
});
if (!['plan','start','progress'].includes(location.hash.slice(1))) history.replaceState(null,'','#plan');
showTab(location.hash.slice(1));

const profileRoot = $('profile-root');
const profileButtons = all('[data-profile-toggle]');
let profileReturnTarget = $('profile-trigger');
function closeProfile(restoreFocus = false) {
  $('profile-panel').hidden = true;
  profileButtons.forEach(button => button.setAttribute('aria-expanded','false'));
  if (restoreFocus) profileReturnTarget.focus();
}
profileButtons.forEach(button => button.addEventListener('click',() => {
  const opening = $('profile-panel').hidden;
  $('profile-panel').hidden = !opening;
  profileButtons.forEach(trigger => trigger.setAttribute('aria-expanded',String(opening)));
  if (opening) {
    profileReturnTarget = button;
    if (button !== $('profile-trigger')) $('profile-close').focus({preventScroll:true});
  }
}));
$('profile-close').addEventListener('click',() => closeProfile(true));
$('profile-back').addEventListener('click',() => { closeProfile(); navigate('plan'); });
document.addEventListener('click',event => { if (!$('profile-panel').hidden && !profileRoot.contains(event.target) && !profileButtons.some(button => button.contains(event.target))) closeProfile(); });
document.addEventListener('keydown',event => {
  if (event.key === 'Escape' && !$('profile-panel').hidden) { event.preventDefault(); closeProfile(true); }
});
profileRoot.addEventListener('focusout',event => { if (!$('profile-panel').hidden && !profileRoot.contains(event.relatedTarget) && !profileButtons.some(button => button.contains(event.relatedTarget))) closeProfile(); });
$('quick-edit-plan').addEventListener('click',() => formFields.contribution.focus());

function formatDate(iso, options = {}) {
  return new Intl.DateTimeFormat('en-US',{timeZone:'UTC',month:'long',day:'numeric',...options}).format(new Date(`${iso}T12:00:00Z`));
}

function renderPayday() {
  $('payday-date').value = payday;
  $('payday-date').min = DEMO_AS_OF;
  $('payday-date-label').textContent = formatDate(payday,{weekday:'long'});
  $('payday-date-label').dateTime = payday;
  $('payday-month').textContent = formatDate(payday,{month:'short',day:undefined}).toUpperCase();
  $('payday-day').textContent = payday.slice(-2);
  $('demo-as-of').textContent = formatDate(DEMO_AS_OF,{year:'numeric'});
  $('demo-as-of').dateTime = DEMO_AS_OF;
  $('last-payday').textContent = formatDate(LAST_PAYDAY);
  $('last-payday').dateTime = LAST_PAYDAY;
}
$('payday-date').addEventListener('change',() => {
  const next = $('payday-date').value;
  if (!isValidPayday(next,DEMO_AS_OF)) {
    setError('payday-error','Choose a valid date on or after December 1, 2026 for this example.');
    $('payday-date').setAttribute('aria-invalid','true');
    return;
  }
  payday = next;
  $('payday-date').removeAttribute('aria-invalid');
  setError('payday-error'); renderPayday();
});

function renderSavingsHistory() {
  const history = state.savingsHistory ?? [];
  const total = history.reduce((sum,entry) => sum + entry.amountCents,0);
  const showHistory = history.length > 0 && total === state.startingCents;
  $('savings-history').hidden = !showHistory;
  $('goal-history-note').hidden = !showHistory;
  if (!showHistory) return;
  let cumulative = 0;
  const bars = history.map(entry => {
    cumulative += entry.amountCents;
    const li = document.createElement('li');
    const value = document.createElement('span'); value.className='history-value'; value.textContent=money(cumulative);
    const bar = document.createElement('span'); bar.className='history-bar'; bar.style.height=`${cumulative / total * 120}px`; bar.setAttribute('aria-hidden','true');
    const month = document.createElement('span'); month.className='history-month'; month.textContent=entry.month;
    li.append(value,bar,month); return li;
  });
  $('history-bars').replaceChildren(...bars);
}

function populateForm() {
  formFields.goalName.value = state.goalName;
  formFields.target.value = asInput(state.targetCents);
  formFields.savings.value = asInput(state.startingCents);
  formFields.paycheck.value = asInput(state.paycheckCents);
  formFields.contribution.value = asInput(state.contributionCents);
  $('lesson-amount').value = asInput(state.contributionCents);
  $('draft-preview').hidden = true;
  Object.values(formFields).forEach(input => input.removeAttribute('aria-invalid'));
  setError('plan-error');
  updateDraftPreview(false);
}

function draftValues() { return Object.fromEntries(Object.entries(formFields).map(([key,input]) => [key,input.value])); }

function updateDraftPreview(showPreview = true) {
  const validation = validateDraft(draftValues());
  const { values, valid } = validation;
  const pay = values.paycheckCents;
  const contribution = values.contributionCents;
  formFields.contribution.style.fontSize = formFields.contribution.value.length > 5 ? '30px' : '';
  const usablePay = pay !== null && pay > 0 ? pay : state.paycheckCents;
  const ratio = contribution !== null ? Math.min(100,Math.max(0,contribution / usablePay * 100)) : 0;
  $('contribution-slider').max = String(usablePay / 100);
  $('contribution-slider').value = String(Math.min(usablePay,contribution ?? 0) / 100);
  $('contribution-slider').setAttribute('aria-valuetext',`${money(contribution ?? 0)} per paycheck`);
  $('slider-max').textContent = `${money(usablePay)} paycheck`;
  $('allocation-percent').textContent = contribution !== null ? `${Math.round(contribution / usablePay * 100)}% of pay` : 'Choose an amount';
  $('allocation-fill').style.width = `${ratio}%`;
  $('allocation-goal').textContent = contribution !== null ? money(contribution) : '—';
  $('allocation-rest').textContent = contribution !== null ? money(Math.max(0,usablePay-contribution)) : '—';
  $('draft-preview').hidden = !showPreview || !valid;
  if (showPreview && valid) {
    const preview = summary({...state,...values});
    $('draft-preview').textContent = preview.remaining === 0 ? 'Preview: this goal is already reached.' : preview.paychecks === null ? 'Choose an amount above $0 to see a paycheck count.' : `Preview: ${preview.paychecks} ${preview.paychecks === 1 ? 'paycheck' : 'paychecks'} to go. Update to keep this plan.`;
  }
}

function render() {
  const s = summary(state);
  const percentText = `${Math.floor(s.percent)}%`;
  const countText = s.remaining === 0 ? 'You reached your goal!' : s.paychecks === null ? 'Choose your next amount' : `${s.paychecks} ${s.paychecks === 1 ? 'paycheck' : 'paychecks'} to go`;
  const bindings = { goalName:state.goalName, target:money(state.targetCents), saved:money(s.saved), remaining:money(s.remaining), paycheck:money(state.paycheckCents), percent:percentText, paychecks:countText, 'contribution-summary':s.remaining === 0 ? 'A small plan. A real milestone.' : `At ${money(state.contributionCents)} per paycheck` };
  all('[data-bind]').forEach(el => { el.textContent = bindings[el.dataset.bind]; });
  document.querySelector('.goal-amount > [data-bind="saved"]').style.fontSize = s.saved >= 10000000 ? '36px' : '';
  document.querySelector('.goal-title-row .muted').textContent = state.goalName === 'First place fund' ? 'A place near campus. A little independence.' : 'One goal. A little more possibility.';
  $('plan-progress').setAttribute('aria-valuenow',String(s.percent.toFixed(2)));
  $('plan-progress').setAttribute('aria-valuetext',`${money(s.saved)} saved toward ${money(state.targetCents)}`);
  $('plan-progress').querySelector('.progress-fill').style.width = `${s.percent}%`;
  $('progress-ring').style.setProperty('--progress',`${s.percent}%`);
  $('progress-ring').setAttribute('aria-valuenow',String(s.percent.toFixed(2)));
  $('progress-ring').setAttribute('aria-valuetext',`${money(s.saved)} saved toward ${money(state.targetCents)}`);
  $('progress-outlook').textContent = s.remaining === 0 ? 'You made room for something that matters.' : s.paychecks === null ? 'Your next step starts with an amount.' : `${s.paychecks} small ${s.paychecks === 1 ? 'step' : 'steps'} from here.`;
  $('plan-next-copy').textContent = s.remaining === 0 ? 'Take a moment. You got here.' : state.contributionCents === 0 ? 'Choose a manageable amount to begin.' : `Set aside ${money(s.nextAmount)} at your own bank.`;
  $('plan-next-help').textContent = s.remaining === 0 ? 'Update your goal when you’re ready for what’s next.' : state.planned ? 'Step planned. Record savings only after you set them aside.' : 'A plan here. A real-world action when you’re ready.';
  $('plan-contribution').firstChild.textContent = s.remaining === 0 ? 'Goal reached ' : state.planned ? 'Step planned ' : 'Plan this step ';
  $('plan-contribution').disabled = s.remaining === 0;
  $('lesson-milestone').classList.toggle('done',state.lessonExplored);
  $('lesson-milestone-help').textContent = state.lessonExplored ? 'You explored “pay yourself first.”' : 'Explore “pay yourself first” in Start Here.';
  $('plan-milestone').classList.toggle('done',state.planned);
  $('plan-milestone-help').textContent = state.planned ? `${money(s.nextAmount)} planned. Record it only once it’s saved.` : state.entries.length ? 'A check-in done. Plan your next contribution.' : 'Choose how much to set aside at your own bank.';
  const nextLabel = s.remaining === 0 ? 'Keep exploring' : !state.lessonExplored ? 'Explore your first lesson' : !state.planned ? 'Plan your next contribution' : 'Make a manual check-in';
  $('progress-next').firstChild.textContent = `${nextLabel} `;
  $('saved-amount').value = asInput(s.nextAmount || Math.min(7500,s.remaining));
  $('saved-amount').max = asInput(s.remaining);
  $('record-button').disabled = s.remaining === 0;
  $('saved-amount').disabled = s.remaining === 0;
  $('last-checkin').hidden = !state.entries.length;
  if (state.entries.length) $('last-checkin-copy').textContent = `Last check-in: ${money(state.entries.at(-1).amountCents)} recorded by you. ${state.entries.length} ${state.entries.length === 1 ? 'check-in' : 'check-ins'} in this demo.`;
  renderSavingsHistory();
}

form.addEventListener('input',() => { updateDraftPreview(); setError('plan-error'); });
$('contribution-slider').addEventListener('input',() => { formFields.contribution.value = $('contribution-slider').value; updateDraftPreview(); setError('plan-error'); });
form.addEventListener('submit',event => {
  event.preventDefault();
  const result = validateDraft(draftValues());
  Object.entries(formFields).forEach(([key,input]) => input.setAttribute('aria-invalid',String(Boolean(result.errors[key]))));
  if (!result.valid) {
    const first = Object.keys(result.errors)[0];
    setError('plan-error',result.errors[first]);
    if (first !== 'contribution') document.querySelector('.plan-details').open = true;
    formFields[first].focus();
    return;
  }
  state = updatePlan(state,result.values);
  populateForm(); render(); setError('record-error');
  notify('Your plan is updated. Small steps, your pace.');
});

$('plan-contribution').addEventListener('click',() => {
  if (state.contributionCents === 0) { formFields.contribution.focus(); notify('Choose an amount above $0 to plan your next step.'); return; }
  state = {...state,planned:true}; render();
  notify(`${money(summary(state).nextAmount)} planned. Nothing is counted as saved yet.`);
});

$('lesson-form').addEventListener('submit',event => {
  event.preventDefault();
  const value = moneyToCents($('lesson-amount').value);
  if (value === null || value > state.paycheckCents) {
    setError('lesson-error',value === null ? 'Enter $0 or more with no more than two decimal places.' : `Choose an amount no larger than your ${money(state.paycheckCents)} paycheck.`);
    $('lesson-amount').setAttribute('aria-invalid','true'); $('lesson-amount').focus(); return;
  }
  $('lesson-amount').removeAttribute('aria-invalid'); setError('lesson-error');
  state = {...state,contributionCents:value,lessonExplored:true,planned:value === state.contributionCents ? state.planned : false};
  populateForm(); render(); navigate('plan');
  notify('Lesson explored. Your chosen amount is in your plan.');
});

$('progress-next').addEventListener('click',() => {
  if (!state.lessonExplored || summary(state).remaining === 0) navigate('start');
  else if (!state.planned) { navigate('plan'); setTimeout(() => $('plan-contribution').focus(),0); }
  else $('saved-amount').focus();
});

$('record-form').addEventListener('submit',event => {
  event.preventDefault();
  try {
    const amount = moneyToCents($('saved-amount').value);
    const next = recordSavings(state,amount);
    state = next; render(); setError('record-error'); $('saved-amount').removeAttribute('aria-invalid');
    notify(summary(state).remaining === 0 ? 'Goal reached. That’s a beginning worth celebrating.' : `${money(amount)} recorded as saved. A little closer.`);
  } catch (error) {
    const remaining = summary(state).remaining;
    setError('record-error',error.message + (remaining > 0 ? ` ${money(remaining)} remains.` : ''));
    $('saved-amount').setAttribute('aria-invalid','true'); $('saved-amount').focus();
  }
});
$('undo-savings').addEventListener('click',() => { state = undoSavings(state); render(); setError('record-error'); notify('Last check-in undone. Your previous balance is restored.'); if (!state.entries.length) $('saved-amount').focus(); });
$('reset-demo').addEventListener('click',() => { state=createDemo(); payday=NEXT_PAYDAY; populateForm();render();renderPayday();setError('lesson-error');setError('record-error');setError('payday-error');$('lesson-amount').removeAttribute('aria-invalid');$('saved-amount').removeAttribute('aria-invalid');$('payday-date').removeAttribute('aria-invalid');notify('Alex’s $700 savings and December 4 payday are restored.'); });

function mountLessonVideo() {
  if (!video || $('video-embed').querySelector('iframe')) return;
  const frame=document.createElement('iframe');
  frame.src=`${video.embed}?rel=0`;
  frame.title=YOUTUBE_TITLE;
  frame.loading='lazy';
  frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
  frame.allowFullscreen=true;
  frame.referrerPolicy='strict-origin-when-cross-origin';
  $('video-embed').replaceChildren(frame);
}
if (video) {
  $('video-placeholder').hidden = true;
  $('configured-video').hidden = false;
  $('video-title').textContent = YOUTUBE_TITLE;
  $('youtube-link').href = video.watch;
} else {
  $('video-placeholder').hidden=false;
  $('configured-video').hidden=true;
}

populateForm();render();renderPayday();
