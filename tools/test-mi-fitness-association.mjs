import assert from 'node:assert/strict';
import {inspectAssociation} from './check-mi-fitness-association.mjs';

const key = '0123456789abcdef'.repeat(2);
const associated = inspectAssociation('prefix ' + JSON.stringify({device: {name: 'Redmi Watch 4 ABCD', encryptKey: key}}));
assert.equal(associated.sameObjectRw4Labels, 1);
assert.equal(associated.authenticationVerified, false);
assert.equal(associated.physicalUnitIdentityVerified, false);
assert(!JSON.stringify(associated).includes(key));
assert.equal(inspectAssociation(JSON.stringify({name: 'M2315W1', token: key})).sameObjectRw4Labels, 1);
const siblings = inspectAssociation(JSON.stringify({devices: [{name: 'Redmi Watch 4'}, {name: 'Other', token: key}]}));
assert.equal(siblings.sameObjectRw4Labels, 0);
assert.equal(siblings.status, 'same-line-rw4-label-only');
assert.equal(inspectAssociation(`Redmi Watch 4 token=${key}`).sameObjectRw4Labels, 0);
assert.equal(inspectAssociation(JSON.stringify({description: 'Redmi Watch 4', token: key})).sameObjectRw4Labels, 0);
assert.equal(inspectAssociation(JSON.stringify({name: 'Redmi Watch 4', token: key + 'a'})).sameObjectRw4Labels, 0);
assert.equal(inspectAssociation(JSON.stringify({payload: JSON.stringify({model: 'M2315W1', authKey: key})})).sameObjectRw4Labels, 1);
assert.equal(inspectAssociation('no candidate or model').status, 'no-explicit-label-found');
console.log('PASS: synthetic same-object labels, sibling isolation, ambiguous text and private output.');
