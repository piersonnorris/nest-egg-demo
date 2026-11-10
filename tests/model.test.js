import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemo, summary, moneyToCents, validateDraft, recordSavings, undoSavings, parseYouTubeUrl } from '../model.js';

test('the deck example takes 16 contributions, without a promised calendar date',() => {
  assert.equal(summary(createDemo()).paychecks,16);
  assert.equal(summary({...createDemo(),contributionCents:8000}).paychecks,15);
  assert.equal(summary({...createDemo(),contributionCents:7000}).paychecks,18);
});
test('planning a step does not move savings; a check-in is undoable',() => {
  const planned={...createDemo(),planned:true};
  assert.equal(summary(planned).saved,0);
  const saved=recordSavings(planned,7500);
  assert.equal(summary(saved).saved,7500);
  assert.equal(summary(saved).paychecks,15);
  assert.equal(saved.planned,false);
  assert.deepEqual(undoSavings(saved),planned);
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
});
