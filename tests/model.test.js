import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemo, summary, moneyToCents, validateDraft, recordSavings, undoSavings, parseYouTubeUrl, isValidPayday, savingsLedger } from '../model.js';
import { DEMO_AS_OF, LAST_PAYDAY, NEXT_PAYDAY, YOUTUBE_URL } from '../config.js';

test('the deck example takes 16 contributions, without a promised calendar date',() => {
  const fromZero = {...createDemo(),startingCents:0,savingsHistory:[]};
  assert.equal(summary(fromZero).paychecks,16);
  assert.equal(summary({...fromZero,contributionCents:8000}).paychecks,15);
  assert.equal(summary({...fromZero,contributionCents:7000}).paychecks,18);
});
test('seven monthly deposits produce a $700 starting balance and seven remaining paychecks',() => {
  const demo=createDemo(), s=summary(demo);
  assert.equal(demo.savingsHistory.length,7);
  assert.ok(demo.savingsHistory.every(entry=>entry.amountCents===10000));
  assert.equal(s.saved,70000);
  assert.equal(s.remaining,50000);
  assert.equal(s.paychecks,7);
  assert.equal(summary({...demo,contributionCents:10000}).paychecks,5);
  assert.deepEqual(undoSavings(demo),demo);
});
test('planning a step does not move savings; a check-in is undoable',() => {
  const planned={...createDemo(),planned:true};
  assert.equal(summary(planned).saved,70000);
  const saved=recordSavings(planned,7500);
  assert.equal(summary(saved).saved,77500);
  assert.equal(summary(saved).paychecks,6);
  assert.equal(saved.planned,false);
  assert.deepEqual(undoSavings(saved),planned);
});

test('the log separates the historical monthly average from new check-ins',()=>{
  const recorded=recordSavings(createDemo(),7500);
  const ledger=savingsLedger(recorded);
  assert.equal(ledger.averageMonthlyCents,10000);
  assert.equal(ledger.months,7);
  assert.equal(ledger.rows.length,8);
  assert.equal(ledger.rows[6].totalCents,70000);
  assert.equal(ledger.rows[7].amountCents,7500);
  assert.equal(ledger.rows[7].totalCents,summary(recorded).saved);
  assert.equal(savingsLedger(undoSavings(recorded)).rows.length,7);
});

test('a custom opening balance never inherits a fictional monthly average',()=>{
  const custom={...createDemo(),startingCents:81234};
  const ledger=savingsLedger(recordSavings(custom,1000));
  assert.equal(ledger.averageMonthlyCents,null);
  assert.equal(ledger.months,0);
  assert.equal(ledger.rows.length,2);
  assert.equal(ledger.rows[0].amountCents,81234);
  assert.equal(ledger.rows.at(-1).totalCents,82234);
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
