import { Component, Element, Event, EventEmitter, h, Host, Method, Prop, State, Watch } from '@stencil/core'
import { createConnectFlow, ConnectFlow, ConnectFlowOptions, ConnectSnapshot, ConnectErrorInfo, ConnectedAccount, Provider } from '@pyas/connect-core'
import { AlertGlyph, CheckGlyph, ChevronGlyph, CloseGlyph, providerMark } from './marks'
import { calendarName, DEFAULT_STRINGS, fill, providerName, PyasConnectStrings } from './strings'

const ALL: Provider[] = ['google', 'microsoft', 'zoom']
const DEFAULT_API_URL = 'https://api.pyas.io'
let instances = 0

/**
 * PyasConnect 2.0: the dialog a developer's users connect a calendar in.
 *
 *   <pyas-connect session-token="pcs_..."></pyas-connect>
 *
 * The flow is @pyas/connect-core's; this renders it. 1.x keeps working:
 * `client-id` + `token-name`, the trigger button with its slot, the
 * `show-*` props, and the `accountConnected` / `connectError` events, sent
 * alongside the new `connected` / `error` / `cancel`.
 *
 * Events follow the design's table: `connected` at once; an `error` that a
 * new attempt cannot fix (an expired session) at once, so the page can make
 * a new one; one the person can still recover from only if they give up and
 * close; `cancel` when they close without connecting.
 */
@Component({ tag: 'pyas-connect', styleUrl: 'pyas-connect.css', shadow: true })
export class PyasConnect {
    @Element() el!: HTMLElement

    /*
     * No prop has an initializer: a page (or a framework wrapper) may set a
     * property before the element is defined, and an initializer would
     * overwrite it as the element upgrades. Defaults apply where props are read.
     */

    /** A connect session's token, made on your server (`POST /v2/connect/sessions`). */
    @Prop({ attribute: 'session-token' }) sessionToken?: string
    /** Or a function that fetches a new session token: then every failure can be tried again in place. */
    @Prop() getSessionToken?: () => Promise<string>
    /** The providers to offer (`google,microsoft,zoom`); the session's own list still applies. */
    @Prop() providers?: string | string[]
    /** The Pyas API: production (`https://api.pyas.io`) by default; a sandbox, preview or local API otherwise. */
    @Prop({ attribute: 'api-url' }) apiUrl?: string
    /** `popup` (default), or `redirect` for a full-page round trip (popup blockers, in-app browsers). */
    @Prop() mode?: 'popup' | 'redirect'
    /** `dialog` (default, opened from the trigger or `open()`) or `inline`, in the page. */
    @Prop({ reflect: true }) display?: 'dialog' | 'inline'
    /** `light` (default), `dark`, or `auto` (follows the system setting). */
    @Prop({ reflect: true }) theme?: 'light' | 'dark' | 'auto'
    /** Any of the widget's words, replaced (also how a translation is supplied): an object, or JSON in the attribute. */
    @Prop() strings?: Partial<PyasConnectStrings> | string
    /** No trigger button: open it with `open()` from your own. */
    @Prop({ attribute: 'hide-trigger' }) hideTrigger?: boolean
    /** Origins of your own OAuth callback page, when your app signs in with its own OAuth app. */
    @Prop({ attribute: 'callback-origins' }) callbackOrigins?: string

    /* 1.x, kept so upgrading changes nothing. Sessions are the way for new code. */
    @Prop({ attribute: 'client-id' }) clientId?: string
    @Prop({ attribute: 'token-name' }) tokenName?: string
    @Prop({ attribute: 'user-name' }) userName?: string
    @Prop({ attribute: 'user-email' }) userEmail?: string
    @Prop({ attribute: 'product-name' }) productName?: string
    @Prop() state?: string
    @Prop({ attribute: 'modal-title' }) modalTitle?: string
    @Prop({ attribute: 'modal-description' }) modalDescription?: string
    /** 1.x: shown unless false. */
    @Prop({ attribute: 'show-google' }) showGoogle?: boolean
    @Prop({ attribute: 'show-outlook' }) showOutlook?: boolean
    @Prop({ attribute: 'show-zoom' }) showZoom?: boolean
    /** 1.x: the details screen's title (now also `strings.detailsTitle`). */
    @Prop({ attribute: 'form-title' }) formTitle?: string
    /** 1.x, accepted and unused: 2.0's buttons always carry their labels. */
    @Prop({ attribute: 'show-labels' }) showLabels?: boolean
    /** 1.x, accepted and unused: iCloud is not offered until Pyas supports it. */
    @Prop({ attribute: 'show-icloud' }) showIcloud?: boolean
    /** 1.x, accepted and unused: "Powered by Pyas" always shows. */
    @Prop({ attribute: 'show-disclaimer' }) showDisclaimer?: boolean
    /** 1.x, accepted and unused: the details screen has no description. */
    @Prop({ attribute: 'form-description' }) formDescription?: string

    /** A calendar was connected. */
    @Event({ eventName: 'connected', composed: true }) connected!: EventEmitter<{ accountId: string; provider: string; email: string; name: string | null; subjectId: string | null }>
    /** The flow ended without connecting: `code`, `message`, `retryable`. */
    @Event({ eventName: 'error', composed: true }) errorEvent!: EventEmitter<ConnectErrorInfo>
    /** The person closed it without connecting. */
    @Event({ eventName: 'cancel', composed: true }) cancelEvent!: EventEmitter<void>
    /** 1.x: as `connected`. */
    @Event({ eventName: 'accountConnected', composed: true }) accountConnected!: EventEmitter<any>
    /** 1.x: as `error`. */
    @Event({ eventName: 'connectError', composed: true }) connectError!: EventEmitter<{ message: string; code: string }>

    @State() snap: ConnectSnapshot | null = null
    @State() isOpen = false
    @State() detailsFor: Provider | null = null
    @State() nameInput = ''
    @State() emailInput = ''
    @State() nameError = false
    @State() emailError = false

    private flow: ConnectFlow | null = null
    private unsubscribe: (() => void) | null = null
    private pendingError: ConnectErrorInfo | null = null
    private returnFocus: HTMLElement | null = null
    private readonly uid = `pyas-connect-${++instances}`
    private legacy: { clientId: string; tokenName: string; state?: string; email?: string; name?: string } | null = null
    private bodyOverflow = ''
    // Closing: whatever the flow reports now is how it ended, so it is sent.
    private closing = false

    private get inline() {
        return this.display === 'inline'
    }

    @Watch('sessionToken')
    @Watch('clientId')
    @Watch('tokenName')
    credentialsChanged() {
        // A new session for a dialog not yet in use takes effect on the next open.
        if (!this.isOpen && this.inline) this.restart()
    }

    componentDidLoad() {
        if (this.inline) this.restart()
    }

    disconnectedCallback() {
        this.teardown()
    }

    /** Opens the dialog. Call it from a click (a sign-in window may only open from one). */
    @Method()
    async open() {
        if (this.inline || this.isOpen) return
        // The focused element itself, inside any shadow root (the trigger is in this one).
        let active = document.activeElement as HTMLElement | null
        while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement as HTMLElement
        this.returnFocus = active
        this.isOpen = true
        this.bodyOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        this.restart()
    }

    /** Closes the dialog, reporting how it ended. */
    @Method()
    async close() {
        if (this.inline || !this.isOpen) return
        this.finish()
        this.isOpen = false
        document.body.style.overflow = this.bodyOverflow
        this.returnFocus?.focus?.()
    }

    private get t(): PyasConnectStrings {
        let custom: Partial<PyasConnectStrings> = {}
        if (typeof this.strings === 'string') {
            try { custom = JSON.parse(this.strings) } catch { custom = {} }
        } else if (this.strings) {
            custom = this.strings
        }
        return {
            ...DEFAULT_STRINGS,
            ...(this.modalTitle ? { chooseTitle: this.modalTitle } : {}),
            ...(this.modalDescription ? { chooseIntro: this.modalDescription } : {}),
            ...(this.formTitle ? { detailsTitle: this.formTitle } : {}),
            ...custom,
        }
    }

    private offered(): Provider[] {
        const raw = this.providers
        if (raw) {
            const list = (Array.isArray(raw) ? raw : raw.split(',')).map((p) => p.trim().toLowerCase())
            return ALL.filter((p) => list.includes(p))
        }
        return ALL.filter((p) => (p === 'google' ? this.showGoogle : p === 'microsoft' ? this.showOutlook : this.showZoom) !== false)
    }

    private restart() {
        this.teardown()
        this.pendingError = null
        this.detailsFor = null
        this.nameInput = this.userName ?? ''
        this.emailInput = this.userEmail ?? ''
        this.nameError = false
        this.emailError = false
        const usesSession = !!(this.getSessionToken || this.sessionToken)
        this.legacy = !usesSession && this.clientId && this.tokenName
            ? { clientId: this.clientId, tokenName: this.tokenName, state: this.state || undefined, email: this.userEmail || undefined, name: this.userName || undefined }
            : null
        const options: ConnectFlowOptions = {
            apiUrl: this.apiUrl || DEFAULT_API_URL,
            session: this.getSessionToken ?? this.sessionToken ?? undefined,
            legacy: this.legacy ?? undefined,
            providers: this.offered(),
            mode: this.mode ?? 'popup',
            callbackOrigins: (this.callbackOrigins ?? '').split(',').map((o) => o.trim()).filter(Boolean),
            onConnected: (account) => this.onConnected(account),
            onError: (error) => this.onError(error),
            onCancel: () => this.cancelEvent.emit(),
        }
        this.flow = createConnectFlow(options)
        this.unsubscribe = this.flow.subscribe((s) => { this.snap = s })
        this.snap = this.flow.getSnapshot()
        void this.flow.start()
    }

    private teardown() {
        this.unsubscribe?.()
        this.flow?.destroy()
        this.unsubscribe = null
        this.flow = null
    }

    /** How the dialog ended, told once as it closes. */
    private finish() {
        this.closing = true
        const s = this.flow?.getSnapshot()
        if (s && s.status !== 'connected') {
            if (s.status === 'failed') {
                if (this.pendingError) this.emitError(this.pendingError)
                else if (!s.error) this.cancelEvent.emit()
            } else {
                // Waiting after the "still there?" question reports CONNECT_TIMEOUT; anything else is a cancel.
                this.flow!.cancel()
            }
        }
        this.pendingError = null
        this.teardown()
        this.closing = false
    }

    private onConnected(account: ConnectedAccount) {
        this.pendingError = null
        const detail = { accountId: account.accountId, provider: account.provider, email: account.email, name: account.name ?? null, subjectId: account.subjectId ?? null }
        this.connected.emit(detail)
        this.accountConnected.emit({ ...account, provider: account.provider, accountId: account.accountId, name: account.name, email: account.email })
    }

    private onError(error: ConnectErrorInfo) {
        // Nothing the person can do here: the page can (a new session), so it hears at once.
        if (!error.retryable || this.closing || this.inline || !this.isOpen) this.emitError(error)
        else this.pendingError = error
    }

    private emitError(error: ConnectErrorInfo) {
        this.errorEvent.emit(error)
        this.connectError.emit({ message: error.message, code: error.code })
    }

    /* ------------------------------ actions ------------------------------ */

    private choose(provider: Provider) {
        // 1.x asked for a name and email when the page had none to give (v1's API needs the email).
        if (this.legacy && (!this.legacy.name || !this.legacy.email)) {
            this.detailsFor = provider
            return
        }
        this.pendingError = null
        this.flow?.choose(provider)
    }

    private submitDetails(event: Event) {
        event.preventDefault()
        this.nameError = !this.nameInput.trim()
        this.emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.emailInput.trim())
        if (this.nameError || this.emailError) {
            const first = this.el.shadowRoot?.getElementById(`${this.uid}-${this.nameError ? 'name' : 'email'}`) as HTMLInputElement | null
            first?.focus()
            return
        }
        if (this.legacy) {
            this.legacy.name = this.nameInput.trim()
            this.legacy.email = this.emailInput.trim()
        }
        const provider = this.detailsFor!
        this.detailsFor = null
        this.flow?.choose(provider)
    }

    private onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && !this.inline) {
            event.stopPropagation()
            void this.close()
            return
        }
        if (event.key !== 'Tab') return
        // Focus stays inside the dialog.
        const root = this.el.shadowRoot
        const dialog = root?.querySelector('.dialog')
        if (!root || !dialog) return
        const focusables = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input, a[href], [tabindex]:not([tabindex="-1"])'))
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = root.activeElement as HTMLElement | null
        if (event.shiftKey && (active === first || !dialog.contains(active))) {
            event.preventDefault()
            last.focus()
        } else if (!event.shiftKey && active === last) {
            event.preventDefault()
            first.focus()
        }
    }

    componentDidRender() {
        if (this.inline || !this.isOpen) return
        // Focus moves into the dialog, and to the new screen's first control when the screen changes.
        const root = this.el.shadowRoot
        const dialog = root?.querySelector<HTMLElement>('.dialog')
        if (!root || !dialog || dialog.contains(root.activeElement)) return
        const target = dialog.querySelector<HTMLElement>('.body button:not([disabled]), .body input') ?? dialog
        target.focus()
    }

    /* ------------------------------ screens ------------------------------ */

    private appName() {
        return this.snap?.app?.name || this.productName || this.t.fallbackApp
    }

    private header() {
        const name = this.appName()
        const icon = this.snap?.app?.iconUrl
        return (
            <div class="header" part="header">
                {icon ? <img class="app-icon" src={icon} alt="" /> : <span class="app-initial" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>}
                <span class="app-name">{name}</span>
                {!this.inline && (
                    <button type="button" class="close" aria-label={this.t.close} onClick={() => void this.close()}>
                        <CloseGlyph />
                    </button>
                )}
            </div>
        )
    }

    private providerButton(provider: Provider) {
        const label = provider === 'google' ? this.t.googleButton : provider === 'microsoft' ? this.t.microsoftButton : this.t.zoomButton
        return (
            <button type="button" class={`provider ${provider}`} part="provider-button" onClick={() => this.choose(provider)}>
                {providerMark(provider)}
                <span class="label">{label}</span>
                <ChevronGlyph />
            </button>
        )
    }

    private titleId() {
        return `${this.uid}-title`
    }

    private screen(s: ConnectSnapshot) {
        const t = this.t
        const provider = s.provider
        const values = { app: this.appName(), provider: providerName(provider), calendar: calendarName(provider), email: s.reconnect?.email ?? this.snap?.account?.email ?? '' }
        const many = s.providers.length > 1
        const title = (text: string) => <h2 class="title" id={this.titleId()} part="title">{text}</h2>

        if (this.detailsFor) {
            return {
                announce: t.detailsTitle,
                body: (
                    <form class="body" onSubmit={(e) => this.submitDetails(e)} novalidate>
                        {title(t.detailsTitle)}
                        <div class="field">
                            <label htmlFor={`${this.uid}-name`}>{t.detailsName}</label>
                            <input id={`${this.uid}-name`} autocomplete="name" value={this.nameInput} aria-invalid={this.nameError ? 'true' : undefined} aria-describedby={this.nameError ? `${this.uid}-name-error` : undefined}
                                onInput={(e) => { this.nameInput = (e.target as HTMLInputElement).value; this.nameError = false }} />
                            {this.nameError && <p class="field-error" id={`${this.uid}-name-error`}>{t.detailsNameNeeded}</p>}
                        </div>
                        <div class="field">
                            <label htmlFor={`${this.uid}-email`}>{t.detailsEmail}</label>
                            <input id={`${this.uid}-email`} type="email" autocomplete="email" value={this.emailInput} aria-invalid={this.emailError ? 'true' : undefined} aria-describedby={this.emailError ? `${this.uid}-email-error` : undefined}
                                onInput={(e) => { this.emailInput = (e.target as HTMLInputElement).value; this.emailError = false }} />
                            {this.emailError && <p class="field-error" id={`${this.uid}-email-error`}>{t.detailsEmailNeeded}</p>}
                        </div>
                        <button type="submit" class="primary" part="primary-button">{t.detailsContinue}</button>
                    </form>
                ),
            }
        }

        switch (s.status) {
            case 'loading':
                return {
                    announce: t.loading,
                    body: <div class="body centered">{title(t.loading)}<div class="spinner" aria-hidden="true" /></div>,
                }
            case 'choosing':
                if (s.reconnect && provider) {
                    return {
                        announce: t.reconnectTitle,
                        body: (
                            <div class="body">
                                {title(t.reconnectTitle)}
                                <p class="lead">{fill(s.reconnect.email ? t.reconnectIntro : t.reconnectIntroNoEmail, values)}</p>
                                <div class="actions">
                                    <button type="button" class="primary" part="primary-button" onClick={() => this.choose(provider)}>{fill(t.reconnectButton, values)}</button>
                                </div>
                            </div>
                        ),
                    }
                }
                return {
                    announce: t.chooseTitle,
                    body: (
                        <div class="body">
                            {title(t.chooseTitle)}
                            <p class="lead">{fill(t.chooseIntro, values)}</p>
                            <div class="actions">{s.providers.map((p) => this.providerButton(p))}</div>
                        </div>
                    ),
                }
            case 'authorizing':
            case 'waiting':
                return {
                    announce: fill(t.waitingTitle, values),
                    body: (
                        <div class="body centered">
                            {title(fill(t.waitingTitle, values))}
                            <div class="spinner" aria-hidden="true" />
                            <p class="lead">{t.waitingBody}</p>
                            {s.slow && <p class="note" role="status">{t.stillThere}</p>}
                            {!s.slow && s.windowMaybeClosed && <p class="note" role="status">{t.windowClosed}</p>}
                            <div class="actions">
                                {(s.slow || s.windowMaybeClosed)
                                    ? <button type="button" class="primary" part="primary-button" onClick={() => this.flow?.reopen()}>{t.openAgain}</button>
                                    : <button type="button" class="link" disabled={s.status !== 'waiting'} onClick={() => this.flow?.reopen()}>{t.reopen}</button>}
                                {s.slow
                                    ? <button type="button" class="secondary" part="secondary-button" onClick={() => this.flow?.back()}>{t.startOver}</button>
                                    : s.windowMaybeClosed && many
                                        ? <button type="button" class="secondary" part="secondary-button" onClick={() => this.flow?.back()}>{t.chooseAnother}</button>
                                        : <button type="button" class="secondary" part="secondary-button" onClick={() => this.flow?.back()}>{t.cancel}</button>}
                            </div>
                        </div>
                    ),
                }
            case 'completing':
                return { announce: t.finishing, body: <div class="body centered">{title(t.finishing)}<div class="spinner" aria-hidden="true" /></div> }
            case 'redirecting':
                return { announce: fill(t.redirecting, values), body: <div class="body centered">{title(fill(t.redirecting, values))}<div class="spinner" aria-hidden="true" /></div> }
            case 'connected':
                return {
                    announce: t.connectedTitle,
                    body: (
                        <div class="body centered">
                            <span class="badge success"><CheckGlyph /></span>
                            {title(t.connectedTitle)}
                            <p class="account"><strong>{s.account?.email}</strong><span>{calendarName(s.account?.provider ?? provider)}</span></p>
                            {!this.inline && (
                                <div class="actions"><button type="button" class="primary" part="primary-button" onClick={() => void this.close()}>{t.done}</button></div>
                            )}
                        </div>
                    ),
                }
            case 'failed':
            case 'cancelled':
            default:
                return this.failure(s, values, many)
        }
    }

    private failure(s: ConnectSnapshot, values: Record<string, string>, many: boolean) {
        const t = this.t
        const code = s.error?.code ?? 'CONNECT_CANCELLED'
        const retryable = s.error ? s.error.retryable : true
        const view = (head: string, body: string, retryLabel: string | null, another: boolean) => ({ head, body, retryLabel: retryable ? retryLabel : null, another: another && many })
        const v = code === 'CONNECT_CONSENT_DENIED' ? view(t.deniedTitle, t.deniedBody, t.tryAgain, true)
            : code === 'CONNECT_POPUP_BLOCKED' ? view(t.blockedTitle, t.blockedBody, t.openWindow, true)
            : code === 'CONNECTION_SCOPE_INSUFFICIENT' ? view(t.scopeTitle, t.scopeBody, t.tryAgain, false)
            : code === 'PROVIDER_UNAVAILABLE' || code === 'PROVIDER_TIMEOUT' ? view(t.unavailableTitle, t.unavailableBody, t.tryAgain, true)
            : code === 'CONNECT_NETWORK_ERROR' ? view(t.networkTitle, t.networkBody, t.tryAgain, false)
            // The developer's session endpoint failed: the person can try again; the developer reads the error event.
            : code === 'CONNECT_SESSION_FAILED' ? view(t.genericTitle, t.genericBody, t.tryAgain, false)
            : code === 'AUTH_INVALID_CONNECT_SESSION' ? view(t.expiredTitle, t.expiredBody, t.tryAgain, false)
            : code === 'BILLING_CONNECTION_LIMIT' || code === 'BILLING_SUBSCRIPTION_REQUIRED' ? view(t.limitTitle, t.limitBody, null, false)
            : code === 'CONNECT_INVALID_CONFIG' || code === 'AUTH_ORIGIN_NOT_ALLOWED' || code === 'CONNECTION_PROVIDER_NOT_CONFIGURED' ? view(t.configTitle, t.configBody, null, false)
            : view(t.genericTitle, t.genericBody, t.tryAgain, true)
        const canClose = !this.inline && !v.retryLabel
        return {
            announce: fill(v.head, values),
            body: (
                <div class="body centered">
                    <span class="badge warning"><AlertGlyph /></span>
                    <h2 class="title" id={this.titleId()} part="title">{fill(v.head, values)}</h2>
                    <p class="lead">{fill(v.body, values)}</p>
                    <div class="actions">
                        {v.retryLabel && <button type="button" class="primary" part="primary-button" onClick={() => { this.pendingError = null; this.flow?.retry() }}>{v.retryLabel}</button>}
                        {v.another && <button type="button" class="secondary" part="secondary-button" onClick={() => { this.pendingError = null; this.flow?.back() }}>{t.chooseAnother}</button>}
                        {canClose && <button type="button" class="primary" part="primary-button" onClick={() => void this.close()}>{t.close}</button>}
                    </div>
                </div>
            ),
        }
    }

    private panel() {
        const s = this.snap
        if (!s) return null
        const { body, announce } = this.screen(s)
        const isDialog = !this.inline
        return (
            <div
                class="dialog"
                part="dialog"
                role={isDialog ? 'dialog' : 'region'}
                aria-modal={isDialog ? 'true' : undefined}
                aria-labelledby={this.titleId()}
                tabindex="-1"
                onKeyDown={this.onKeyDown}
            >
                {this.header()}
                {body}
                <div class="sr-only" aria-live="polite">{announce}</div>
                <div class="footer" part="footer">
                    <a href="https://pyas.io" target="_blank" rel="noopener noreferrer">{this.t.poweredBy}</a>
                </div>
            </div>
        )
    }

    render() {
        if (this.inline) return <Host class="inline">{this.panel()}</Host>
        return (
            <Host>
                {!this.hideTrigger && (
                    <button type="button" class="trigger" part="trigger" aria-haspopup="dialog" onClick={() => void this.open()}>
                        <slot>{this.t.trigger}</slot>
                    </button>
                )}
                {this.isOpen && (
                    <div class="overlay" onClick={(e) => { if (e.target === e.currentTarget) void this.close() }}>
                        {this.panel()}
                    </div>
                )}
            </Host>
        )
    }
}
