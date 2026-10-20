import { describe, it, expect, vi } from 'vitest'
import { createApi } from '../src/api'
import { apiError, ConnectError } from '../src/errors'
import { postCallbackResult } from '../src/callback'

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })

const api = (fetchImpl: (...a: any[]) => Promise<Response>, over = {}) =>
    createApi({ apiUrl: 'https://api.pyas.test/', fetch: fetchImpl as typeof fetch, sleep: async () => {}, ...over })

describe('the API client', () => {
    it('gets the consent URL with the session token, sending nothing of the page', async () => {
        const fetchMock = vi.fn(async () => json(200, { success: true, data: { provider: 'google', url: 'https://accounts.google.test/?state=s', expiresAt: 'x' } }))
        const res = await api(fetchMock).authorize('pcs_t', 'google')
        expect(res.url).toBe('https://accounts.google.test/?state=s')
        const [url, init] = fetchMock.mock.calls[0] as any[]
        expect(url).toBe('https://api.pyas.test/v2/connect/authorize')
        expect(init).toMatchObject({ method: 'POST', credentials: 'omit' })
        expect(JSON.parse(init.body)).toEqual({ token: 'pcs_t', provider: 'google' })
    })

    it('retries the consent URL on 5xx, 429 and network failures, honouring Retry-After', async () => {
        const sleeps: number[] = []
        const fetchMock = vi.fn()
            .mockRejectedValueOnce(new TypeError('offline'))
            .mockResolvedValueOnce(json(503, { error: { code: 'PROVIDER_UNAVAILABLE', message: 'down' } }))
            .mockResolvedValueOnce(json(429, { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'slow down' } }, { 'retry-after': '2' }))
            .mockResolvedValueOnce(json(200, { success: true, data: { provider: 'google', url: 'u', expiresAt: 'x' } }))
        const res = await api(fetchMock, { retries: 3, sleep: async (ms: number) => { sleeps.push(ms) } }).authorize('t')
        expect(res.url).toBe('u')
        expect(fetchMock).toHaveBeenCalledTimes(4)
        expect(sleeps[2]).toBe(2_000)
    })

    it('never retries the exchange: the code works once', async () => {
        const fetchMock = vi.fn(async () => json(503, { error: { code: 'PROVIDER_UNAVAILABLE', message: 'down', traceId: 'trc_1' } }))
        await expect(api(fetchMock).complete('t', 'code', 'state')).rejects.toMatchObject({ code: 'PROVIDER_UNAVAILABLE', retryable: true, traceId: 'trc_1' })
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('a request that hangs is cut off and reported as a network failure', async () => {
        const fetchMock = vi.fn((_u: string, init: RequestInit) => new Promise<Response>((_, reject) => {
            init.signal!.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
        }))
        await expect(api(fetchMock, { requestTimeoutMs: 20, retries: 0 }).authorize('t')).rejects.toMatchObject({ code: 'CONNECT_NETWORK_ERROR', retryable: true })
    })

    it('keeps the API code and says whether trying again can help', () => {
        expect(apiError(401, { error: { code: 'AUTH_INVALID_CONNECT_SESSION', message: 'expired' } })).toMatchObject({ code: 'AUTH_INVALID_CONNECT_SESSION', retryable: false })
        expect(apiError(403, { error: { code: 'AUTH_ORIGIN_NOT_ALLOWED', message: 'no' } })).toMatchObject({ retryable: false })
        expect(apiError(429, { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'slow' } })).toMatchObject({ retryable: true })
        expect(apiError(502, null)).toMatchObject({ code: 'CONNECT_NETWORK_ERROR', retryable: true })
        expect(apiError(400, { success: false, error: 'v1 said no' })).toMatchObject({ message: 'v1 said no' })
        expect(apiError(500, {})).toBeInstanceOf(ConnectError)
    })

    it('1.x keys: the old consent address and exchange, with the API\'s own callback', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(json(200, { success: true, url: 'https://accounts.google.test/?state=s' }))
            .mockResolvedValueOnce(json(200, { success: true, data: { account: { accountId: 'a1' } } }))
        const client = api(fetchMock)
        expect(await client.legacyInit({ provider: 'google', clientId: 'c', tokenName: 'web', state: 'mine' })).toBe('https://accounts.google.test/?state=s')
        const initUrl = new URL(fetchMock.mock.calls[0][0])
        expect(initUrl.pathname).toBe('/oauth/init')
        expect(Object.fromEntries(initUrl.searchParams)).toMatchObject({ provider: 'google', clientId: 'c', tokenName: 'web', state: 'mine', redirectUrl: 'https://api.pyas.test/oauth/callback' })
        expect(await client.legacyConnect({ provider: 'google', clientId: 'c', tokenName: 'web', code: 'x' })).toEqual({ accountId: 'a1' })
        expect(client.redirectUrl('pcs_t', 'zoom')).toBe('https://api.pyas.test/v2/connect/go?token=pcs_t&provider=zoom')
        expect(client.origin).toBe('https://api.pyas.test')
    })
})

describe('postCallbackResult (a callback page on your own OAuth app)', () => {
    it("hands the result to the widget's window on the same origin, by this attempt's state, then closes", () => {
        vi.useFakeTimers()
        const opener = { postMessage: vi.fn() }
        const win = { location: { search: '?code=4%2Fc&state=app_id%3Dx_rest%3Dpcs1.cs_a.n1', origin: 'https://app.customer.test' }, opener, close: vi.fn() } as unknown as Window
        expect(postCallbackResult(win)).toBe(true)
        expect(opener.postMessage).toHaveBeenCalledWith({ type: 'pyas-oauth-complete', code: '4/c', state: 'pcs1.cs_a.n1', error: null }, 'https://app.customer.test')
        vi.advanceTimersByTime(300)
        expect((win as any).close).toHaveBeenCalled()
        vi.useRealTimers()
    })

    it('does nothing without an opener or a result', () => {
        expect(postCallbackResult({ location: { search: '?code=c', origin: 'x' }, opener: null } as unknown as Window)).toBe(false)
        expect(postCallbackResult({ location: { search: '', origin: 'x' }, opener: { postMessage: vi.fn() } } as unknown as Window)).toBe(false)
    })
})
