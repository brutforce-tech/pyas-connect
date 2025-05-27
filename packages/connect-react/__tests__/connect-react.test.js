'use strict';

const connectReact = require('..');
const assert = require('assert').strict;

assert.strictEqual(connectReact(), 'Hello from connectReact');
console.info('connectReact tests passed');
