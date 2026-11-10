export const MAX_CENTS = 100_000_000;

export function createDemo() {
  const savingsHistory = ['May','Jun','Jul','Aug','Sep','Oct','Nov'].map(month => ({ month, amountCents: 10000 }));
  return { goalName: 'First place fund', targetCents: 120000,
    startingCents: savingsHistory.reduce((sum, entry) => sum + entry.amountCents, 0), savingsHistory,
    paycheckCents: 30000, contributionCents: 7500, lessonExplored: false, planned: false, entries: [] };
}

export function isValidPayday(value, asOf) {
  const validDate = date => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) return false;
    const parsed = new Date(`${date}T12:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === date;
  };
  return validDate(value) && validDate(asOf) && value >= asOf;
}

export function moneyToCents(value) {
  const text = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
  const cents = Math.round(Number(text) * 100);
  return Number.isSafeInteger(cents) && cents <= MAX_CENTS ? cents : null;
}

export function summary(state) {
  const saved = state.startingCents + state.entries.reduce((total, entry) => total + entry.amountCents, 0);
  const remaining = Math.max(0, state.targetCents - saved);
  return { saved, remaining, percent: Math.min(100, saved / state.targetCents * 100),
    paychecks: remaining === 0 ? 0 : state.contributionCents > 0 ? Math.ceil(remaining / state.contributionCents) : null,
    nextAmount: Math.min(state.contributionCents, remaining) };
}

export function validateDraft(draft) {
  const errors = {};
  const name = String(draft.goalName ?? '').trim();
  const values = { goalName: name, targetCents: moneyToCents(draft.target), startingCents: moneyToCents(draft.savings),
    paycheckCents: moneyToCents(draft.paycheck), contributionCents: moneyToCents(draft.contribution) };
  if (!name || name.length > 40) errors.goalName = 'Give your goal a name of 1–40 characters.';
  if (values.targetCents === null || values.targetCents <= 0) errors.target = 'Enter a goal above $0, up to $1,000,000, with no more than two decimal places.';
  if (values.startingCents === null) errors.savings = 'Enter starting savings of $0 or more, up to $1,000,000, with no more than two decimal places.';
  if (values.paycheckCents === null || values.paycheckCents <= 0) errors.paycheck = 'Enter take-home pay above $0, up to $1,000,000, with no more than two decimal places.';
  if (values.contributionCents === null) errors.contribution = 'Enter an amount of $0 or more with no more than two decimal places.';
  else if (values.paycheckCents !== null && values.contributionCents > values.paycheckCents) errors.contribution = 'Leave room for your essentials. Choose an amount no larger than your paycheck.';
  return { values, errors, valid: Object.keys(errors).length === 0 };
}

export function updatePlan(state, values) {
  const changed = ['goalName','targetCents','startingCents','paycheckCents','contributionCents'].some(key => state[key] !== values[key]);
  return { ...state, ...values, planned: changed ? false : state.planned };
}

export function recordSavings(state, amountCents) {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) throw new Error('Enter the amount you saved, above $0, with no more than two decimal places.');
  const { remaining } = summary(state);
  if (remaining === 0) throw new Error('You’ve reached this goal. Update your plan to start a new one.');
  if (amountCents > remaining) throw new Error('That is more than this goal still needs. Record up to the remaining amount.');
  return { ...state, planned: false, entries: [...state.entries, { amountCents, wasPlanned: state.planned }] };
}

export function undoSavings(state) {
  if (!state.entries.length) return state;
  return { ...state, planned: state.entries.at(-1).wasPlanned, entries: state.entries.slice(0,-1) };
}

export function savingsLedger(state) {
  const history=state.savingsHistory??[];
  const historyTotal=history.reduce((sum,entry)=>sum+entry.amountCents,0);
  const hasHistory=history.length>0 && historyTotal===state.startingCents;
  const rows=hasHistory?history.map(entry=>({label:`${entry.month} 2026`,amountCents:entry.amountCents})):[{label:'Starting balance (adjusted)',amountCents:state.startingCents}];
  state.entries.forEach((entry,index)=>rows.push({label:`Demo check-in ${index+1}`,amountCents:entry.amountCents}));
  let total=0;
  return {
    averageMonthlyCents:hasHistory?Math.round(historyTotal/history.length):null,
    months:hasHistory?history.length:0,
    rows:rows.map(row=>({...row,totalCents:total+=row.amountCents}))
  };
}

export function parseYouTubeUrl(value) {
  if (!value || !String(value).trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    let id;
    if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
    else if (['youtube.com','www.youtube.com','m.youtube.com'].includes(url.hostname)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v');
      else if (/^\/(shorts|embed)\//.test(url.pathname)) id = url.pathname.split('/')[2];
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(id ?? '') ? { id, watch: `https://www.youtube.com/watch?v=${id}`, embed: `https://www.youtube-nocookie.com/embed/${id}` } : null;
  } catch { return null; }
}
