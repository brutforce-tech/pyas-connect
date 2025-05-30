/*
 * Public API Surface of connect-angular
 */

import { defineCustomElements } from '@pyas/connect/loader';

export function pyasConnectLoader() {
  defineCustomElements(window)
};

export * from './lib/connect-angular.module';
export { DIRECTIVES } from './lib/index';
export * from './lib/components';