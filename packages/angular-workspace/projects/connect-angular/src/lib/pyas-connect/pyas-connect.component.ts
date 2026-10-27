import {
    AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, Input, NgZone, OnChanges,
    OnDestroy, Output, PLATFORM_ID, SimpleChanges,
} from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import type { ConnectErrorInfo, PyasConnectStrings } from '@pyas/connect'

/**
 * PyasConnect for Angular: the <pyas-connect> element, with Angular inputs and
 * outputs. No UI of its own: one element serves every framework.
 * Its selector is the element's own tag, so the host Angular creates is the
 * element; inputs are set on it as properties, and its events come out as
 * outputs carrying the event's data, as 1.x's did.
 *
 * An output named like a DOM event the element sends would run a template's
 * handler twice (Angular listens for both, and the DOM one hands over the
 * CustomEvent). So the wrapper takes each event first (capture, at the
 * element), emits the output, and stops the DOM event there: Angular apps get
 * outputs only, as with 1.x, which sent no DOM events.
 *
 *   <pyas-connect [sessionToken]="token" (connected)="save($event.accountId)"></pyas-connect>
 */

export interface ConnectedAccount {
    accountId: string
    provider: string
    email: string
    name: string | null
    subjectId: string | null
}

type ElementWithMethods = HTMLElement & { open(): Promise<void>; close(): Promise<void> } & Record<string, unknown>

/** Defines <pyas-connect> once, in the browser only (server rendering never touches customElements). */
let defining: Promise<unknown> | null = null
export const definePyasConnect = () => (defining ??= import('@pyas/connect/dist/components/pyas-connect.js'))

@Component({
    standalone: true,
    selector: 'pyas-connect',
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PyasConnect implements OnChanges, AfterViewInit, OnDestroy {
    /** A connect session's token, made on your server (`POST /v2/connect/sessions`). */
    @Input() sessionToken?: string
    /** Or a function that fetches a new one: then every failure can be tried again in place. */
    @Input() getSessionToken?: () => Promise<string>
    @Input() providers?: string | string[]
    @Input() apiUrl?: string
    @Input() mode?: 'popup' | 'redirect'
    @Input() display?: 'dialog' | 'inline'
    @Input() theme?: 'light' | 'dark' | 'auto'
    @Input() strings?: Partial<PyasConnectStrings>
    @Input() hideTrigger?: boolean
    @Input() callbackOrigins?: string

    /* 1.x */
    @Input() clientId?: string
    @Input() tokenName?: string
    @Input() userName?: string
    @Input() userEmail?: string
    @Input() productName?: string
    @Input() state?: string
    @Input() modalTitle?: string
    @Input() modalDescription?: string
    @Input() formTitle?: string
    @Input() formDescription?: string
    @Input() showGoogle?: boolean
    @Input() showOutlook?: boolean
    @Input() showZoom?: boolean
    @Input() showLabels?: boolean
    @Input() showIcloud?: boolean
    @Input() showDisclaimer?: boolean

    @Output() connected = new EventEmitter<ConnectedAccount>()
    @Output() error = new EventEmitter<ConnectErrorInfo>()
    @Output() cancel = new EventEmitter<void>()
    /** 1.x: as `connected`. */
    @Output() accountConnected = new EventEmitter<ConnectedAccount & Record<string, unknown>>()
    /** 1.x: as `error`. */
    @Output() connectError = new EventEmitter<{ message: string; code: string }>()

    private readonly browser: boolean
    private readonly off: Array<() => void> = []

    constructor(private readonly host: ElementRef<ElementWithMethods>, private readonly zone: NgZone, @Inject(PLATFORM_ID) platformId: object) {
        this.browser = isPlatformBrowser(platformId)
    }

    ngOnChanges(changes: SimpleChanges) {
        const el = this.host.nativeElement as Record<string, unknown>
        for (const name of Object.keys(changes)) {
            const value = changes[name].currentValue
            if (value !== undefined) el[name] = value
        }
    }

    ngAfterViewInit() {
        if (!this.browser) return
        void definePyasConnect()
        const outputs: Record<string, EventEmitter<any>> = {
            connected: this.connected, error: this.error, cancel: this.cancel,
            accountConnected: this.accountConnected, connectError: this.connectError,
        }
        for (const [name, output] of Object.entries(outputs)) {
            const listener = (e: Event) => {
                if (e.target !== this.host.nativeElement) return
                e.stopImmediatePropagation()
                this.zone.run(() => output.emit((e as CustomEvent).detail))
            }
            this.host.nativeElement.addEventListener(name, listener, true)
            this.off.push(() => this.host.nativeElement.removeEventListener(name, listener, true))
        }
    }

    ngOnDestroy() {
        this.off.forEach((f) => f())
    }

    /** Opens the dialog. Call it from a click. */
    async open() {
        await definePyasConnect()
        await this.host.nativeElement.open()
    }

    async close() {
        await this.host.nativeElement.close()
    }
}
