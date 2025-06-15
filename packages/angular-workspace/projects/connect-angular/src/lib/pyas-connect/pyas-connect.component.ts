import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    getOauthUrl,
    openOAuthPopup
} from '@pyas/connect';
import { ProviderButtonComponent } from '../provider-button/provider-button.component';
import { ICONS } from '../provider-button/provider-button.component';

@Component({
    standalone: true,
    selector: 'pyas-connect',
    encapsulation: ViewEncapsulation.None,
    imports: [ CommonModule, FormsModule, ProviderButtonComponent],

    templateUrl: './pyas-connect.component.html',
    styleUrls: [
      './pyas-connect.component.scss'
    ],
    changeDetection: ChangeDetectionStrategy.Default
})
export class PyasConnect {
    // readonly ICONS = ICONS;
    // Inputs
    @Input() clientId!: string;
    @Input() tokenName!: string;
    @Input() theme: 'light'|'dark' = 'light';
    @Input() productName = 'This app';
    @Input() userName = '';
    @Input() userEmail = '';
    @Input() showLabels = true;
    @Input() showGoogle = true;
    @Input() showOutlook = true;
    @Input() showZoom = true;
    @Input() showIcloud = false;
    @Input() showDisclaimer = true;
    @Input() state = '';
    @Input() modalTitle = 'Connect an Account';
    @Input() modalDescription = '';
    @Input() formTitle = 'Enter Your Details';
    @Input() formDescription = '';

    // Outputs
    @Output() accountConnected = new EventEmitter<any>();
    @Output() connectError     = new EventEmitter<any>();

    // Internal UI state
    open = false;
    step: 1|2 = 1;
    name = this.userName;
    email = this.userEmail;
    loading = false;

    safeIconSvg!: SafeHtml;

    selectedProvider = '';

    constructor(private sanitizer: DomSanitizer) {}

    ngOnChanges(changes: SimpleChanges) {
      // this.safeIconSvg = this.sanitizer.bypassSecurityTrustHtml(ICONS[this.selectedProvider] || '');
      if (changes['userName']) {
        this.name = changes['userName'].currentValue;
      }
      if (changes['userEmail']) {
        this.email = changes['userEmail'].currentValue;
      }
    }



  // show step-2 form
  handleNext(provider: string) {
      this.step = 2;
      this.selectedProvider = provider;
  }


  getSelectedProviderLabel() {
      switch (this.selectedProvider) {
        case 'google':    return 'Google';
        case 'microsoft': return 'Microsoft';
        case 'zoom':      return 'Zoom';
        case 'icloud':    return 'iCloud';
        default:          return '';
      }
  }

  getSafeIconSvg(): SafeHtml {
      return this.sanitizer.bypassSecurityTrustHtml(ICONS[this.selectedProvider] || '');
  }

  // go back
  goBack() {
      this.step = 1;
  }

  async submit() {
      this.loading = true;
      const payload = {
          provider:  this.selectedProvider,
          clientId:  this.clientId,
          tokenName: this.tokenName,
          state:     this.state,
          email:     this.email,
          name:      this.name,
      };

    let res = await getOauthUrl(payload);
    this.loading = false;

    if (!res.success) {
        return this.connectError.emit(res.error);
    }

    let popup = await openOAuthPopup({ ...payload, url: res.url! });
    this.loading = false;
    if (popup.success)  this.accountConnected.emit(popup.account);
    else                this.connectError.emit(popup.error);
  }

  // open / close modal
  openModal() {
    this.open = true;
  }
  closeModal() {
    this.open = false;
    this.step = 1;
    this.loading = false;
    this.name = this.userName;
    this.email = this.userEmail;
    this.selectedProvider = '';
  }
}
