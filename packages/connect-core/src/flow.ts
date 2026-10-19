/**
 * The PyasConnect flow, without a UI: a state machine the web component (or
 * anyone's own UI) drives and renders.
 *
 *   choosing ─choose()─▶ authorizing ─▶ waiting ─▶ completing ─▶ connected
 *                            │             │            │
 *                            └─────────────┴────────────┴──▶ failed ─retry()─▶ authorizing
 *   any time: cancel() ─▶ cancelled; destroy() ─▶ nothing left behind
 *
 * Security (plan §59): a callback message is taken only from the API's origin
 * (or an origin the developer listed for their own callback page), only from
 * the popup this flow opened, and only with this attempt's state. Anything
 * else is ignored, not reported. Codes are single-use on the API's side.
 *
 * A popup that reads as closed is only a hint: Google's sign-in pages set a
 * Cross-Origin-Opener-Policy, after which `closed` can read true while the
 * person is still signing in. The flow ends on the message, a cancel or the
 * consent timeout; the person can open the window again meanwhile.
 *
 * `choose()`, `retry()` and `reopen()` open a window, so call them straight
 * from a click: a window opened after an `await` is blocked.
 */

import { ConnectApi, ConnectedAccount, createApi, Provider } from './api'
import { ConnectError, connectError, ConnectErrorInfo } from './errors'

export type ConnectStatus = 'choosing' | 'authorizing' | 'waiting' | 'completing' | 'connected' | 'failed' | 'cancelled' | 'redirecting'

export interface ConnectSnapshot {
    status: ConnectStatus
    /** The providers offered. */
    providers: Provider[]
    /** The provider of the current or last attempt. */
    provider: Provider | null
    account: ConnectedAccount | null
    error: ConnectErrorInfo | null
    /** Waiting, and the sign-in window may have been closed: offer to open it again. */
    windowMaybeClosed: boolean
}

export interface LegacyCredentials {
    clientId: string
    tokenName: string
    state?: string
    email?: string
    name?: string
}

export interface ConnectFlowOptions {
    /** The Pyas API. Default https://api.pyas.io. */
    apiUrl?: string
    /**
     * A connect session's token (`POST /v2/connect/sessions` on your server),
     * or a function that fetches a new one for each attempt (then every
     * failure can be retried in place).
     */
    session?: string | (() => Promise<string>)
    /** 1.x: the app's client id and token name. Sessions are the way for new code. */
    legacy?: LegacyCredentials
    /** The providers to offer. Default Google, Microsoft and Zoom; a session's own list still applies. */
    providers?: Provider[]
    /** Start straight with this provider (a reconnect). */
    provider?: Provider
    /** `popup` (default) or `redirect` (the whole page goes, for popup blockers and mobile). */
    mode?: 'popup' | 'redirect'
    /** How long to wait for the person at the provider. Default 2 minutes. */
    consentTimeoutMs?: number
    /** Origins besides the API's whose callback page may post the result (your own, on your own OAuth app). */
    callbackOrigins?: string[]
    onConnected?: (account: ConnectedAccount) => void
    onError?: (error: ConnectErrorInfo) => void
    onCancel?: () => void
    /** For tests. */
    window?: Window
    api?: ConnectApi
}

const ALL_PROVIDERS: Provider[] = ['google', 'microsoft', 'zoom']
const POPUP_NAME = 'pyas_connect'
const PROVIDER_NAMES: Record<Provider, string> = { google: 'Google', microsoft: 'Microsoft', zoom: 'Zoom' }

export const createConnectFlow = (opts: ConnectFlowOptions) => {
    const win = opts.window ?? window
    const api = opts.api ?? createApi({ apiUrl: opts.apiUrl ?? 'https://api.pyas.io' })
    const consentTimeoutMs = opts.consentTimeoutMs ?? 120_000
    // The page's own origin too: a callback page on it (postCallbackResult) could control this page anyway.
    const trusted = new Set([api.origin, win.location.origin, ...(opts.callbackOrigins ?? []).map((o) => new URL(o).origin)])
    const providers = (opts.providers?.length ? opts.providers : ALL_PROVIDERS).filter((p, i, a) => ALL_PROVIDERS.includes(p) && a.indexOf(p) === i)

    let snapshot: ConnectSnapshot = { status: 'choosing', providers, provider: null, account: null, error: null, windowMaybeClosed: false }
    const listeners = new Set<(s: ConnectSnapshot) => void>()
    const set = (patch: Partial<ConnectSnapshot>) => {
        snapshot = { ...snapshot, ...patch }
        listeners.forEach((l) => l(snapshot))
    }

    // The attempt in flight: anything that arrives for an older one is ignored.
    let attempt = 0
    let popup: Window | null = null
    let consentUrl: string | null = null
    let expectedState: string | null = null
    let token: string | null = null
    let timeout: ReturnType<typeof setTimeout> | null = null
    let closedPoll: ReturnType<typeof setInterval> | null = null
    let destroyed = false

    const stopWaiting = () => {
        if (timeout) clearTimeout(timeout)
        if (closedPoll) clearInterval(closedPoll)
        timeout = null
        closedPoll = null
        win.removeEventListener('message', onMessage)
    }
    const closePopup = () => {
        try { popup?.close() } catch { /* a window we can no longer reach */ }
        popup = null
    }
    const fail = (error: ConnectError, forAttempt: number) => {
        if (forAttempt !== attempt || destroyed) return
        stopWaiting()
        closePopup()
        set({ status: 'failed', error: error.toJSON(), windowMaybeClosed: false })
        opts.onError?.(error.toJSON())
    }
    /** A failure the API answered with: a spent session can be retried only with a new token. */
    const sessionFailure = (error: unknown): ConnectError => {
        const e = error instanceof ConnectError ? error : connectError('CONNECT_NETWORK_ERROR')
        if (typeof opts.session === 'function' && (e.code === 'CONNECTION_CONSENT_FAILED' || e.code === 'AUTH_INVALID_CONNECT_SESSION')) {
            return new ConnectError({ ...e.toJSON(), retryable: true })
        }
        if (typeof opts.session === 'string' && (e.code === 'CONNECTION_CONSENT_FAILED' || e.code === 'AUTH_INVALID_CONNECT_SESSION')) {
            return new ConnectError({ ...e.toJSON(), retryable: false })
        }
        return e
    }

    const tokenFor = async (): Promise<string> => {
        if (typeof opts.session === 'function') {
            const fresh = await opts.session()
            if (typeof fresh !== 'string' || !fresh) throw connectError('CONNECT_INVALID_CONFIG', 'The connect session could not be created. Try again.')
            return fresh
        }
        return opts.session as string
    }

    const openWindow = (url: string): Window | null => {
        const w = 500
        const h = 640
        const left = Math.max(0, (win.screenX ?? 0) + ((win.outerWidth ?? w) - w) / 2)
        const top = Math.max(0, (win.screenY ?? 0) + ((win.outerHeight ?? h) - h) / 2.5)
        return win.open(url, POPUP_NAME, `popup=yes,width=${w},height=${h},left=${Math.round(left)},top=${Math.round(top)}`)
    }

    const onMessage = (event: MessageEvent) => {
        const data = event.data as { type?: string; code?: string; state?: string; error?: string } | null
        if (!data || data.type !== 'pyas-oauth-complete') return
        if (!trusted.has(event.origin)) return
        if (!popup || event.source !== popup) return
        // This attempt's state, and only it: the session's state names the attempt (`pcs1.<session>.<nonce>`).
        if (expectedState !== null && (typeof data.state !== 'string' || !data.state || !expectedState.includes(data.state))) return
        const forAttempt = attempt
        stopWaiting()
        if (data.error || !data.code) {
            fail(data.error === 'access_denied' ? connectError('CONNECT_CONSENT_DENIED') : connectError('CONNECT_PROVIDER_ERROR'), forAttempt)
            return
        }
        void finish(data.code, data.state ?? '', forAttempt)
    }

    const finish = async (code: string, state: string, forAttempt: number) => {
        set({ status: 'completing', windowMaybeClosed: false })
        closePopup()
        try {
            const account = opts.legacy
                ? await api.legacyConnect({ provider: snapshot.provider!, clientId: opts.legacy.clientId, tokenName: opts.legacy.tokenName, code, name: opts.legacy.name })
                : await api.complete(token!, code, state)
            if (forAttempt !== attempt || destroyed) return
            set({ status: 'connected', account, error: null })
            opts.onConnected?.(account)
        } catch (error) {
            fail(sessionFailure(error), forAttempt)
        }
    }

    const waitForConsent = (forAttempt: number) => {
        set({ status: 'waiting', windowMaybeClosed: false })
        win.addEventListener('message', onMessage)
        timeout = setTimeout(() => fail(connectError('CONNECT_TIMEOUT'), forAttempt), consentTimeoutMs)
        closedPoll = setInterval(() => {
            let closed = false
            try { closed = !popup || popup.closed } catch { closed = false }
            if (closed && !snapshot.windowMaybeClosed) set({ windowMaybeClosed: true })
        }, 1000)
    }

    /** Start with a provider. Call it straight from the click. */
    const choose = (provider: Provider) => {
        if (destroyed) return
        if (!providers.includes(provider)) {
            fail(connectError('CONNECT_INVALID_CONFIG', `${provider} is not offered here.`), attempt)
            return
        }
        if (!opts.session && !opts.legacy) {
            fail(connectError('CONNECT_INVALID_CONFIG', 'Give the widget a connect session token.'), attempt)
            return
        }
        stopWaiting()
        closePopup()
        const forAttempt = ++attempt
        consentUrl = null
        expectedState = null
        set({ status: (opts.mode ?? 'popup') === 'redirect' ? 'redirecting' : 'authorizing', provider, account: null, error: null, windowMaybeClosed: false })

        if ((opts.mode ?? 'popup') === 'redirect') {
            if (opts.legacy) {
                fail(connectError('CONNECT_INVALID_CONFIG', 'Redirect mode needs a connect session.'), forAttempt)
                return
            }
            void tokenFor().then((t) => {
                if (forAttempt === attempt && !destroyed) win.location.assign(api.redirectUrl(t, provider))
            }, (error) => fail(error instanceof ConnectError ? error : connectError('CONNECT_NETWORK_ERROR'), forAttempt))
            return
        }

        // Opened now, in the click; pointed at the consent page once its address is known.
        popup = openWindow('about:blank')
        if (!popup) {
            fail(connectError('CONNECT_POPUP_BLOCKED'), forAttempt)
            return
        }
        try {
            popup.document.title = `${PROVIDER_NAMES[provider]} sign-in`
            popup.document.body.textContent = `Opening ${PROVIDER_NAMES[provider]} sign-in...`
        } catch { /* not ours to write to: fine */ }

        void (async () => {
            try {
                let url: string
                if (opts.legacy) {
                    url = await api.legacyInit({ provider, clientId: opts.legacy.clientId, tokenName: opts.legacy.tokenName, state: opts.legacy.state, email: opts.legacy.email })
                } else {
                    token = await tokenFor()
                    url = (await api.authorize(token, provider)).url
                }
                if (forAttempt !== attempt || destroyed) return
                consentUrl = url
                const state = new URL(url).searchParams.get('state')
                // Sessions bind every message to this attempt; 1.x states may be empty, so they rely on origin and window.
                expectedState = opts.legacy ? (state && state.includes('_rest=') && state.split('_rest=')[1] ? state : null) : state
                if (!popup || popup.closed) {
                    popup = openWindow(url)
                    if (!popup) {
                        fail(connectError('CONNECT_POPUP_BLOCKED'), forAttempt)
                        return
                    }
                } else {
                    popup.location.href = url
                }
                waitForConsent(forAttempt)
            } catch (error) {
                fail(sessionFailure(error), forAttempt)
            }
        })()
    }

    return {
        getSnapshot: () => snapshot,
        subscribe(listener: (s: ConnectSnapshot) => void) {
            listeners.add(listener)
            return () => { listeners.delete(listener) }
        },
        /** Opens on the chooser, or straight on a provider when there is only one (call it from the click). */
        start() {
            if (opts.provider) return choose(opts.provider)
            if (providers.length === 1) return choose(providers[0])
            set({ status: 'choosing', provider: null, account: null, error: null, windowMaybeClosed: false })
        },
        choose,
        /** The sign-in window again, while waiting (call it from the click). */
        reopen() {
            if (snapshot.status !== 'waiting' || !consentUrl) return
            const again = openWindow(consentUrl)
            if (!again) {
                fail(connectError('CONNECT_POPUP_BLOCKED'), attempt)
                return
            }
            popup = again
            set({ windowMaybeClosed: false })
        },
        /** After a failure that can be retried: the same provider again (call it from the click). */
        retry() {
            if (snapshot.status !== 'failed' && snapshot.status !== 'cancelled') return
            if (snapshot.error && !snapshot.error.retryable) return
            if (snapshot.provider) choose(snapshot.provider)
            else set({ status: 'choosing', error: null })
        },
        /** Back to the providers, from a failure or the wait. */
        back() {
            attempt++
            stopWaiting()
            closePopup()
            set({ status: 'choosing', provider: null, error: null, account: null, windowMaybeClosed: false })
        },
        cancel() {
            if (snapshot.status === 'connected' || snapshot.status === 'cancelled') return
            attempt++
            stopWaiting()
            closePopup()
            set({ status: 'cancelled', windowMaybeClosed: false })
            opts.onCancel?.()
        },
        /** Everything this flow started, stopped: listeners, timers, the window. */
        destroy() {
            destroyed = true
            attempt++
            stopWaiting()
            closePopup()
            listeners.clear()
        },
    }
}

export type ConnectFlow = ReturnType<typeof createConnectFlow>
