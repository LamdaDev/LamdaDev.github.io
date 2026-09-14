import test from 'node:test';
import assert from 'node:assert/strict';
import { activityAt, advanceElapsed } from './sequence.ts';

test('coding changes immediately at 6, 8, and 11 seconds', () => {
  assert.deepEqual([5.999, 6, 7.999, 8, 10.999, 11].map(t => activityAt('projects', t).action), ['code', 'drink', 'drink', 'nap', 'nap', 'code']);
});
test('boba introduction is followed only by sipping, even after long revisits', () => {
  assert.equal(activityAt('about', 2.399).action, 'order');
  for (const t of [2.4, 10, 1000]) assert.equal(activityAt('about', t).action, 'sip');
});
test('gym cuts to resting and returns to bench pressing', () => {
  assert.deepEqual([0, 4.999, 5, 8.999, 9].map(t => activityAt('experience', t).action), ['bench', 'bench', 'rest', 'rest', 'bench']);
});
test('offscreen and paused clocks stay unchanged; delayed frames cannot skip an activity', () => {
  assert.equal(advanceElapsed(2, 10, false, false), 2);
  assert.equal(advanceElapsed(2, 10, true, true), 2);
  assert.equal(advanceElapsed(2, 10, true, false), 2.1);
});
test('reduced motion has stable representative poses', () => {
  assert.deepEqual(activityAt('experience', 500, true), activityAt('experience', 0, true));
  assert.equal(activityAt('about', 0, true).action, 'sip');
});
