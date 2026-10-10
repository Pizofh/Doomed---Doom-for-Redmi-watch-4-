import assert from 'node:assert/strict';
import {countCoreMarkers} from './check-mi-fitness-core-service.mjs';
const privateCanary = 'private-test-key-and-address-do-not-export';
const result = countCoreMarkers([
  privateCanary + ' useLyra() called supportLyra:true, enable:true, permission:true',
  'init() called with: bind lyra service result true',
  'init() called with: bind lyra service result false',
  'runningOnClient() called',
  'unrelated ' + privateCanary,
  'x'.repeat(2 * 1024 * 1024 + 1) + ' runningOnClient() called',
].join('\n'));
assert.equal(result.counts.LYRA_ALL_TRUE, 1);
assert.equal(result.counts.RUNNING_CLIENT, 1);
assert.equal(result.counts.BIND_SUCCEEDED, 1);
assert.equal(result.counts.BIND_FAILED, 1);
assert.equal(result.skippedLongLines, 1);
assert(!JSON.stringify(result).includes(privateCanary));
assert.equal(countCoreMarkers('useLyra() called supportLyra:true, enable:false, permission:true').counts.LYRA_ALL_TRUE, 0);
console.log('Core marker privacy/decision tests passed (synthetic logs, no radio).');
