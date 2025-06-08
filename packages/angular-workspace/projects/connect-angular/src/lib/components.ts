/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, NgZone } from '@angular/core';

import { ProxyCmp, proxyOutputs } from './angular-component-lib/utils';

import { Components } from '@pyas/connect';


@ProxyCmp({
  inputs: ['clientId', 'formDescription', 'formTitle', 'modalDescription', 'modalTitle', 'productName', 'showDisclaimer', 'showGoogle', 'showIcloud', 'showLabels', 'showOutlook', 'showZoom', 'state', 'theme', 'tokenName', 'userEmail', 'userName']
})
@Component({
  selector: 'pyas-connect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['clientId', 'formDescription', 'formTitle', 'modalDescription', 'modalTitle', 'productName', 'showDisclaimer', 'showGoogle', 'showIcloud', 'showLabels', 'showOutlook', 'showZoom', 'state', 'theme', 'tokenName', 'userEmail', 'userName'],
})
export class PyasConnect {
  protected el: HTMLPyasConnectElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['accountConnected', 'connectError']);
  }
}


export declare interface PyasConnect extends Components.PyasConnect {
  /**
   * Emit connection result
   */
  accountConnected: EventEmitter<CustomEvent<{ provider: string; accountId: string, name: string, email: string, scopes: string[], status: string }>>;
  /**
   * Emit error result
   */
  connectError: EventEmitter<CustomEvent<{ message: string, code: string|number|undefined, error?: any }>>;
}


