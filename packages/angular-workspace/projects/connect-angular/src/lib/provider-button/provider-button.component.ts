import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
    GoogleIconSvg,
    OutlookIconSvg,
    ZoomIconSvg,
    ICloudIconSvg
} from '@pyas/connect';

export const ICONS: Record<string,string> = {
    google:    GoogleIconSvg,
    microsoft: OutlookIconSvg,
    zoom:      ZoomIconSvg,
    icloud:    ICloudIconSvg
};

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'connect-provider-button',
    templateUrl: './provider-button.component.html',
    styleUrls: ['./provider-button.component.css'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class ProviderButtonComponent {
    /** one of 'google' | 'microsoft' | 'zoom' | 'icloud' */
    @Input() provider!: keyof typeof ICONS;
    @Input() label!: string;
    @Input() showLabel = true;

    /** emits provider key when clicked */
    @Output() select = new EventEmitter<typeof this.provider>();

    safeIconSvg!: SafeHtml;

    constructor(private sanitizer: DomSanitizer) {}

    ngOnChanges() {
      // whenever provider changes, re-sanitize
      this.safeIconSvg = this.sanitizer.bypassSecurityTrustHtml(ICONS[this.provider] || '');
    }

    onClick() {
      this.select.emit(this.provider);
    }
}
