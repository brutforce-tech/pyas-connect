import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createConnectFlow, ConnectFlowOptions } from '../src/flow'
import { ConnectError } from '../src/errors'
import type { ConnectApi } from '../src/api'

const API = 'https://api.pyas.test'
const PAGE = 'https://app.customer.test'
const STATE = 'app_id=app-1_rest=pcs1.cs_abc.nonce1.sig'

interface FakePopup { closed: boolean; close: () => void; location: { href: string }; document: { title: string; body: { textContent: string } } }

const fakeWindow = () => {
    const listeners = new Set<(e: MessageEvent) => void>()
    const popups: FakePopup[] = []
    let blocked = false
    const win = {
        location: { origin: PAGE, assign: vi.fn() },
        screenX: 0, screenY: 0, outerWidth: 1200, outerHeight: 900,
        open: vi.fn((url: string) => {
            if (blocked) return null
            const p: FakePopup = { closed: false, close() { this.closed = true }, location: { href: url }, document: { title: '', body: { textContent: '' } } }
            popups.push(p)
            return p
        }),
        addEventListener: (type: string, fn: any) => { if (type === 'message') listeners.add(fn) },
        removeEventListener: (type: string, fn: any) => { if (type === 'message') listeners.delete(fn) },
    }
    const post = (data: unknown, opts: { origin?: string; source?: unknown } = {}) =>
        listeners.forEach((l) => l({ data, origin: opts.origin ?? API, source: opts.source ?? popups[popups.length - 1] } as MessageEvent))
    return { win: win as unknown as Window, raw: win, popups, post, listeners, block: (b: boolean) => { blocked = b } }
}

const fakeApi = (over: Partial<ConnectApi> = {}): ConnectApi => ({
    origin: API,
    info: vi.fn(async () => ({ app: { name: 'Acme Scheduling', iconUrl: 'https://icons.test/acme.png' }, providers: ['google', 'microsoft'], reconnect: null, loginHint: null, expiresAt: '' })) as any,
    authorize: vi.fn(async (_t: string, provider?: string) => ({ provider: provider as any, url: `https://accounts.google.test/o/oauth2/auth?state=${encodeURIComponent(STATE)}`, expiresAt: '' })),
    complete: vi.fn(async () => ({ accountId: 'acc-1', provider: 'google', email: 'ana@example.com', name: 'Ana', subjectId: null })),
    redirectUrl: vi.fn((t: string, p?: string) => `${API}/v2/connect/go?token=${t}&provider=${p}`),
    legacyInit: vi.fn(async () => `https://accounts.google.test/o/oauth2/auth?state=${encodeURIComponent('app_id=app-1_rest=mystate.sig')}`),
    legacyConnect: vi.fn(async () => ({ accountId: 'acc-legacy', provider: 'google', email: 'ana@example.com', name: 'Ana', subjectId: null })),
    ...over,
} as ConnectApi)

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('the connect flow', () => {
    let w: ReturnType<typeof fakeWindow>
    const make = (over: Partial<ConnectFlowOptions> = {}, api = fakeApi()) => {
        const events = { connected: vi.fn(), error: vi.fn(), cancel: vi.fn() }
        const flow = createConnectFlow({ window: w.win, api, session: 'pcs_token', onConnected: events.connected, onError: events.error, onCancel: events.cancel, ...over })
        return { flow, api, events }
    }
    beforeEach(() => { w = fakeWindow() })
    afterEach(() => { vi.useRealTimers() })

    it('connects: a window opened in the click, the consent page, this attempt\'s message, then the account', async () => {
        const { flow, api, events } = make()
        flow.choose('google')
        // Opened before anything was awaited, so no browser blocks it.
        expect(w.raw.open).toHaveBeenCalledTimes(1)
        expect(w.raw.open.mock.calls[0][0]).toBe('about:blank')
        expect(flow.getSnapshot().status).toBe('authorizing')
        await flush()
        expect(api.authorize).toHaveBeenCalledWith('pcs_token', 'google')
        expect(w.popups[0].location.href).toContain('accounts.google.test')
        expect(flow.getSnapshot().status).toBe('waiting')

        w.post({ type: 'pyas-oauth-complete', code: '4/code', state: 'pcs1.cs_abc.nonce1' })
        await flush()
        expect(api.complete).toHaveBeenCalledWith('pcs_token', '4/code', 'pcs1.cs_abc.nonce1')
        expect(flow.getSnapshot()).toMatchObject({ status: 'connected', account: { accountId: 'acc-1' }, error: null })
        expect(events.connected).toHaveBeenCalledWith(expect.objectContaining({ accountId: 'acc-1' }))
        expect(w.popups[0].closed).toBe(true)
        expect(w.listeners.size).toBe(0)
    })

    it('ignores any message not from the API, not from its window, or not for this attempt', async () => {
        const { flow, api } = make()
        flow.choose('google')
        await flush()
        w.post({ type: 'pyas-oauth-complete', code: 'x', state: 'pcs1.cs_abc.nonce1' }, { origin: 'https://evil.test' })
        w.post({ type: 'pyas-oauth-complete', code: 'x', state: 'pcs1.cs_abc.nonce1' }, { source: {} })
        w.post({ type: 'pyas-oauth-complete', code: 'x', state: 'pcs1.cs_other.nonce9' })
        w.post({ type: 'pyas-oauth-complete', code: 'x', state: '' })
        w.post({ type: 'something-else', code: 'x', state: 'pcs1.cs_abc.nonce1' })
        await flush()
        expect(api.complete).not.toHaveBeenCalled()
        expect(flow.getSnapshot().status).toBe('waiting')
    })

    it('a blocked window fails at once, and can be retried', async () => {
        w.block(true)
        const { flow, events } = make()
        flow.choose('microsoft')
        expect(flow.getSnapshot()).toMatchObject({ status: 'failed', error: { code: 'CONNECT_POPUP_BLOCKED', retryable: true } })
        expect(events.error).toHaveBeenCalledWith(expect.objectContaining({ code: 'CONNECT_POPUP_BLOCKED' }))
        w.block(false)
        flow.retry()
        await flush()
        expect(flow.getSnapshot()).toMatchObject({ status: 'waiting', provider: 'microsoft' })
    })

    it('a "no" at the provider is CONNECT_CONSENT_DENIED; retry starts a new attempt', async () => {
        const { flow, api } = make()
        flow.choose('google')
        await flush()
        w.post({ type: 'pyas-oauth-complete', error: 'access_denied', state: 'pcs1.cs_abc.nonce1' })
        await flush()
        expect(flow.getSnapshot()).toMatchObject({ status: 'failed', error: { code: 'CONNECT_CONSENT_DENIED', retryable: true } })
        expect(api.complete).not.toHaveBeenCalled()
        flow.retry()
        await flush()
        expect(api.authorize).toHaveBeenCalledTimes(2)
    })

    it('after the consent wait it asks whether they are still there and keeps waiting; giving up then is CONNECT_TIMEOUT', async () => {
        vi.useFakeTimers()
        const { flow, api, events } = make({ consentTimeoutMs: 5_000 })
        flow.choose('google')
        await vi.advanceTimersByTimeAsync(0)
        await vi.advanceTimersByTimeAsync(5_000)
        // No time limit they cannot extend: still waiting, and the answer still counts.
        expect(flow.getSnapshot()).toMatchObject({ status: 'waiting', slow: true })
        expect(events.error).not.toHaveBeenCalled()
        flow.cancel()
        expect(events.error).toHaveBeenCalledWith(expect.objectContaining({ code: 'CONNECT_TIMEOUT' }))
        expect(events.cancel).not.toHaveBeenCalled()
        expect(w.popups[0].closed).toBe(true)
        expect(w.listeners.size).toBe(0)

        // Answering late still connects.
        const late = make({ consentTimeoutMs: 5_000 })
        late.flow.choose('google')
        await vi.advanceTimersByTimeAsync(10_000)
        w.post({ type: 'pyas-oauth-complete', code: 'c', state: 'pcs1.cs_abc.nonce1' })
        await vi.advanceTimersByTimeAsync(0)
        expect(late.flow.getSnapshot().status).toBe('connected')
        expect(api.complete).not.toHaveBeenCalled()
    })

    it('a window that reads as closed is a hint, not a cancel: the result still counts, and it can be opened again', async () => {
        vi.useFakeTimers()
        const { flow, api } = make()
        flow.choose('google')
        await vi.advanceTimersByTimeAsync(0)
        w.popups[0].closed = true
        await vi.advanceTimersByTimeAsync(1_000)
        expect(flow.getSnapshot()).toMatchObject({ status: 'waiting', windowMaybeClosed: true })
        flow.reopen()
        expect(w.popups).toHaveLength(2)
        expect(w.popups[1].location.href).toContain('accounts.google.test')
        expect(flow.getSnapshot().windowMaybeClosed).toBe(false)
        w.post({ type: 'pyas-oauth-complete', code: '4/c', state: 'pcs1.cs_abc.nonce1' }, { source: w.popups[1] })
        await vi.advanceTimersByTimeAsync(0)
        expect(api.complete).toHaveBeenCalled()
        expect(flow.getSnapshot().status).toBe('connected')
    })

    it('a session spent by a failed exchange: final with a fixed token, retryable with a token function (a new token each attempt)', async () => {
        const spent = new ConnectError({ code: 'CONNECTION_CONSENT_FAILED', message: 'The sign-in has expired or was already used. Start again.', retryable: true })
        const fixed = make({}, fakeApi({ complete: vi.fn(async () => { throw spent }) }))
        fixed.flow.choose('google')
        await flush()
        w.post({ type: 'pyas-oauth-complete', code: 'c', state: 'pcs1.cs_abc.nonce1' })
        await flush()
        expect(fixed.flow.getSnapshot()).toMatchObject({ status: 'failed', error: { code: 'CONNECTION_CONSENT_FAILED', retryable: false } })
        fixed.flow.retry()
        expect(fixed.flow.getSnapshot().status).toBe('failed')

        w = fakeWindow()
        let n = 0
        const fresh = make({ session: async () => `pcs_fresh_${++n}` }, fakeApi({ complete: vi.fn(async () => { throw spent }) }))
        fresh.flow.choose('google')
        await flush()
        w.post({ type: 'pyas-oauth-complete', code: 'c', state: 'pcs1.cs_abc.nonce1' })
        await flush()
        expect(fresh.flow.getSnapshot()).toMatchObject({ status: 'failed', error: { retryable: true } })
        fresh.flow.retry()
        await flush()
        expect(fresh.api.authorize).toHaveBeenLastCalledWith('pcs_fresh_2', 'google')
    })

    it('cancel stops listening and closes the window; a late message is ignored', async () => {
        const { flow, api, events } = make()
        flow.choose('google')
        await flush()
        flow.cancel()
        expect(flow.getSnapshot().status).toBe('cancelled')
        expect(events.cancel).toHaveBeenCalled()
        expect(w.popups[0].closed).toBe(true)
        w.post({ type: 'pyas-oauth-complete', code: 'c', state: 'pcs1.cs_abc.nonce1' })
        await flush()
        expect(api.complete).not.toHaveBeenCalled()
    })

    it('an answer for an older attempt is ignored once a newer one started', async () => {
        let resolveFirst: (v: any) => void = () => {}
        const api = fakeApi({
            authorize: vi.fn()
                .mockImplementationOnce(() => new Promise((r) => { resolveFirst = r }))
                .mockImplementation(async () => ({ provider: 'microsoft', url: `https://login.microsoft.test/?state=${encodeURIComponent(STATE)}`, expiresAt: '' })) as any,
        })
        const { flow } = make({}, api)
        flow.choose('google')
        flow.back()
        flow.choose('microsoft')
        await flush()
        resolveFirst({ provider: 'google', url: 'https://accounts.google.test/?state=old', expiresAt: '' })
        await flush()
        expect(flow.getSnapshot()).toMatchObject({ status: 'waiting', provider: 'microsoft' })
        expect(w.popups[w.popups.length - 1].location.href).toContain('login.microsoft.test')
    })

    it('destroy leaves nothing running', async () => {
        vi.useFakeTimers()
        const { flow, events } = make({ consentTimeoutMs: 1_000 })
        flow.choose('google')
        await vi.advanceTimersByTimeAsync(0)
        flow.destroy()
        expect(flow.getSnapshot().slow).toBe(false)
        await vi.advanceTimersByTimeAsync(5_000)
        expect(w.listeners.size).toBe(0)
        expect(events.error).not.toHaveBeenCalled()
        expect(vi.getTimerCount()).toBe(0)
    })

    it('redirect mode sends the page to the API with the session; it needs a session', async () => {
        const { flow } = make({ mode: 'redirect' })
        flow.choose('zoom')
        expect(flow.getSnapshot().status).toBe('redirecting')
        await flush()
        expect(w.raw.location.assign).toHaveBeenCalledWith(`${API}/v2/connect/go?token=pcs_token&provider=zoom`)
        expect(w.raw.open).not.toHaveBeenCalled()

        const legacy = make({ mode: 'redirect', session: undefined, legacy: { clientId: 'c', tokenName: 't' } })
        legacy.flow.choose('google')
        expect(legacy.flow.getSnapshot()).toMatchObject({ status: 'failed', error: { code: 'CONNECT_INVALID_CONFIG', retryable: false } })
    })

    it('1.x keys still connect: the old consent address and exchange', async () => {
        const { flow, api } = make({ session: undefined, legacy: { clientId: 'client-1', tokenName: 'web', name: 'Ana' } })
        flow.choose('google')
        await flush()
        expect(api.legacyInit).toHaveBeenCalledWith(expect.objectContaining({ provider: 'google', clientId: 'client-1', tokenName: 'web' }))
        w.post({ type: 'pyas-oauth-complete', code: 'c1', state: 'mystate.sig' })
        await flush()
        expect(api.legacyConnect).toHaveBeenCalledWith(expect.objectContaining({ code: 'c1', clientId: 'client-1', name: 'Ana' }))
        expect(flow.getSnapshot()).toMatchObject({ status: 'connected', account: { accountId: 'acc-legacy' } })
    })

    it("start reads whose app is asking and the session's providers, then waits for a click; nothing works without credentials", async () => {
        const { flow, api } = make({ providers: ['google', 'microsoft', 'zoom'] })
        const loading = flow.start()
        expect(flow.getSnapshot().status).toBe('loading')
        await loading
        expect(api.info).toHaveBeenCalledWith('pcs_token')
        // Narrowed to the session's own providers; no window opened without a click.
        expect(flow.getSnapshot()).toMatchObject({ status: 'choosing', app: { name: 'Acme Scheduling' }, providers: ['google', 'microsoft'], reconnect: null })
        expect(w.raw.open).not.toHaveBeenCalled()
        flow.choose('zoom')
        expect(flow.getSnapshot()).toMatchObject({ status: 'failed', error: { code: 'CONNECT_INVALID_CONFIG' } })

        const legacy = make({ session: undefined, legacy: { clientId: 'c', tokenName: 't' } })
        await legacy.flow.start()
        expect(legacy.flow.getSnapshot()).toMatchObject({ status: 'choosing', app: null })

        const none = make({ session: undefined })
        none.flow.choose('google')
        expect(none.flow.getSnapshot()).toMatchObject({ status: 'failed', error: { code: 'CONNECT_INVALID_CONFIG' } })
    })

    it("a reconnect names the account and its provider; a token function's first token is used for the first attempt", async () => {
        let n = 0
        const api = fakeApi({ info: vi.fn(async () => ({ app: { name: 'Acme', iconUrl: null }, providers: ['microsoft'], reconnect: { email: 'bo@contoso.test', provider: 'microsoft' }, loginHint: null, expiresAt: '' })) as any })
        const { flow } = make({ session: async () => `pcs_${++n}` }, api)
        await flow.start()
        expect(flow.getSnapshot()).toMatchObject({ status: 'choosing', provider: 'microsoft', reconnect: { email: 'bo@contoso.test' } })
        flow.choose('microsoft')
        await flush()
        expect(api.authorize).toHaveBeenCalledWith('pcs_1', 'microsoft')
        expect(n).toBe(1)
    })

    it('a session that cannot be read fails with the API code; a token function can load again', async () => {
        const expired = new ConnectError({ code: 'AUTH_INVALID_CONNECT_SESSION', message: 'expired', retryable: false })
        const fixed = make({}, fakeApi({ info: vi.fn(async () => { throw expired }) as any }))
        await fixed.flow.start()
        expect(fixed.flow.getSnapshot()).toMatchObject({ status: 'failed', error: { code: 'AUTH_INVALID_CONNECT_SESSION', retryable: false } })

        const info = vi.fn().mockRejectedValueOnce(expired).mockResolvedValue({ app: { name: 'Acme', iconUrl: null }, providers: ['google'], reconnect: null, loginHint: null, expiresAt: '' })
        const fresh = make({ session: async () => 'pcs_new' }, fakeApi({ info: info as any }))
        await fresh.flow.start()
        expect(fresh.flow.getSnapshot().error).toMatchObject({ retryable: true })
        fresh.flow.retry()
        await flush()
        expect(fresh.flow.getSnapshot()).toMatchObject({ status: 'choosing', providers: ['google'] })
    })
})
