'use strict';

const connectVue = require('..');
const assert = require('assert').strict;

assert.strictEqual(connectVue(), 'Hello from connectVue');
console.info('connectVue tests passed');
