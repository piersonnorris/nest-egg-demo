import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemo, summary, moneyToCents, validateDraft, recordSavings, undoSavings, parseYouTubeUrl, isValidPayday, savingsLedger, compareSavings } from '../model.js';
import { DEMO_AS_OF, LAST_PAYDAY, NEXT_PAYDAY, YOUTUBE_URL } from '../config.js';

test('the deck example takes 16 contributions, without a promised calendar date',() => {
  const fromZero = {...createDemo(),startingCents:0,savingsHistory:[]};
  assert.equal(summary(fromZero).paychecks,16);
  assert.equal(summary({...fromZero,contributionCents:8000}).paychecks,15);
  assert.equal(summary({...fromZero,contributionCents:7000}).paychecks,18);
});
test('the five varied payments total $475 with ten remaining paychecks',() => {
  const demo=createDemo(), s=summary(demo);
  assert.deepEqual(demo.savingsHistory.map(entry=>entry.amountCents),[7500,7500,12500,5000,15000]);
  assert.equal(s.saved,47500);
  assert.equal(s.remaining,72500);
  assert.equal(s.paychecks,10);
  assert.equal(summary({...demo,contributionCents:10000}).paychecks,8);
  assert.deepEqual(undoSavings(demo),demo);
});
test('planning a step does not move savings; a check-in is undoable',() => {
  const planned={...createDemo(),planned:true};
  assert.equal(summary(planned).saved,47500);
  const saved=recordSavings(planned,7500);
  assert.equal(summary(saved).saved,55000);
  assert.equal(summary(saved).paychecks,9);
  assert.equal(saved.planned,false);
  assert.deepEqual(undoSavings(saved),planned);
});

test('the payment average and running total update with recorded check-ins and undo',()=>{
  const recorded=recordSavings(createDemo(),7500);
  const ledger=savingsLedger(recorded);
  assert.equal(ledger.averagePaymentCents,9167);
  assert.equal(ledger.paymentCount,6);
  assert.equal(ledger.rows.length,6);
  assert.equal(ledger.rows[4].totalCents,47500);
  assert.equal(ledger.rows[5].amountCents,7500);
  assert.equal(ledger.rows[5].totalCents,summary(recorded).saved);
  assert.equal(savingsLedger(undoSavings(recorded)).averagePaymentCents,9500);
  assert.equal(savingsLedger(recordSavings(createDemo(),5000)).averagePaymentCents,8750);
});

test('a custom opening balance is excluded from the payment average and comparisons',()=>{
  const custom={...createDemo(),startingCents:81234};
  const ledger=savingsLedger(recordSavings(custom,1000));
  assert.equal(savingsLedger(custom).averagePaymentCents,null);
  assert.equal(ledger.averagePaymentCents,1000);
  assert.equal(ledger.paymentCount,1);
  assert.equal(ledger.rows.length,2);
  assert.equal(ledger.rows[0].amountCents,81234);
  assert.equal(ledger.rows[0].comparison,null);
  assert.equal(ledger.rows.at(-1).totalCents,82234);
});

test('the $95 average exceeds the $75 target and each payment gets the right comparison',()=>{
  const ledger=savingsLedger(createDemo());
  assert.equal(ledger.averagePaymentCents,9500);
  assert.deepEqual(compareSavings(9500),{differenceCents:2000,status:'above'});
  assert.deepEqual(ledger.rows.map(row=>row.comparison.status),['at','at','above','below','above']);
  assert.deepEqual(ledger.rows.map(row=>row.comparison.differenceCents),[0,0,5000,-2500,7500]);
});
test('the last contribution uses only the remaining amount and completes the goal',() => {
  const state={...createDemo(),startingCents:119500};
  assert.equal(summary(state).nextAmount,500);
  const met=recordSavings(state,500);
  assert.equal(summary(met).remaining,0);
  assert.equal(summary(met).paychecks,0);
  assert.equal(summary(met).percent,100);
  assert.throws(()=>recordSavings(state,501),/more than/);
  assert.throws(()=>recordSavings(met,100),/reached/);
});
test('zero contributions and already-met goals avoid invalid calculations',() => {
  assert.equal(summary({...createDemo(),contributionCents:0}).paychecks,null);
  const met={...createDemo(),startingCents:130000,contributionCents:0};
  assert.equal(summary(met).paychecks,0);
  assert.equal(summary(met).percent,100);
});
test('money is parsed to cents and rejects invalid or overprecise values',() => {
  assert.equal(moneyToCents('0.29'),29);
  assert.equal(moneyToCents('1000000'),100000000);
  for(const value of ['', '-1','NaN','1.234','1e5','1000001']) assert.equal(moneyToCents(value),null,value);
  assert.throws(()=>recordSavings(createDemo(),null),/above/);
});
test('a plan needs sensible inputs and a contribution within take-home pay',() => {
  const draft={goalName:'Deposit',target:'1200',savings:'0',paycheck:'300',contribution:'75'};
  assert.equal(validateDraft(draft).valid,true);
  assert.equal(validateDraft({...draft,contribution:'0'}).valid,true);
  assert.ok(validateDraft({...draft,contribution:'301'}).errors.contribution);
  assert.ok(validateDraft({...draft,target:'0'}).errors.target);
  assert.ok(validateDraft({...draft,paycheck:'0'}).errors.paycheck);
  assert.ok(validateDraft({...draft,goalName:' '}).errors.goalName);
});
test('YouTube configuration accepts supported HTTPS video URLs only',() => {
  const id='abcdefghijk';
  for(const url of [`https://youtu.be/${id}`,`https://www.youtube.com/watch?v=${id}&t=1`,`https://youtube.com/shorts/${id}`]) assert.equal(parseYouTubeUrl(url).id,id);
  for(const url of ['', 'javascript:alert(1)',`https://youtube.com.evil.example/watch?v=${id}`,`http://youtu.be/${id}`,'https://youtu.be/bad']) assert.equal(parseYouTubeUrl(url),null);
  assert.equal(parseYouTubeUrl(YOUTUBE_URL).id,'IIKr2915l2g');
});
test('the presentation timeline has November 20 paid and December 4 next, as of December 1',() => {
  assert.equal(DEMO_AS_OF,'2026-12-01');
  assert.equal(LAST_PAYDAY,'2026-11-20');
  assert.equal(NEXT_PAYDAY,'2026-12-04');
  assert.ok(isValidPayday(NEXT_PAYDAY,DEMO_AS_OF));
  assert.equal(isValidPayday(LAST_PAYDAY,DEMO_AS_OF),false);
  assert.equal(isValidPayday('2026-02-30','2026-01-01'),false);
  assert.equal((Date.parse(NEXT_PAYDAY)-Date.parse(LAST_PAYDAY))/86400000,14);
});
