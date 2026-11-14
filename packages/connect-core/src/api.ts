/**
 * The Pyas API calls the widget makes, from the browser. No key: a connect
 * session's token (or a 1.x client id and token name) in the request.
 *
 * Every request has a timeout. Getting the consent URL is retried with backoff
 * on network failures, 5xx and 429 (it is safe to repeat: each call makes a new
 * attempt). Finishing is never retried by itself: the provider's code works
 * once, so a retry after a lost answer would report a failure for a
 * connection that worked.
 */

import { apiError, connectError, ConnectError } from './errors'

export type Provider = 'google' | 'microsoft' | 'zoom'

export interface ConnectedAccount {
    accountId: string
    provider: Provider | string
    email: string
    name: string | null
    subjectId: string | null
    /** The account was connected before: this connected it again. */
    existing?: boolean
}

export interface SessionInfo {
    app: { name: string; iconUrl: string | null }
    providers: Provider[]
    /** A reconnect: the account it is for. */
    reconnect: { email: string | null; provider: Provider } | null
    loginHint: string | null
    expiresAt: string
}

export interface ApiOptions {
    /** Where the Pyas API is: production, a sandbox, a preview or a local API. */
    apiUrl: string
    fetch?: typeof fetch
    /** Per request. Default 15 seconds. */
    requestTimeoutMs?: number
    /** Retries for the consent URL. Default 3. */
    retries?: number
    sleep?: (ms: number) => Promise<void>
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const createApi = (opts: ApiOptions) => {
    const base = opts.apiUrl.replace(/\/+$/, '')
    const doFetch = opts.fetch ?? ((...args: Parameters<typeof fetch>) => fetch(...args))
    const timeoutMs = opts.requestTimeoutMs ?? 15_000
    const retries = opts.retries ?? 3
    const sleep = opts.sleep ?? defaultSleep

    const once = async (method: 'GET' | 'POST', path: string, body?: unknown): Promise<{ status: number; body: any; retryAfterMs: number | null }> => {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)
        try {
            const res = await doFetch(`${base}${path}`, {
                method,
                headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
                body: body === undefined ? undefined : JSON.stringify(body),
                // Nothing of the host page's goes to Pyas.
                credentials: 'omit',
                signal: controller.signal,
            })
            const parsed = await res.json().catch((): null => null)
            const retryAfter = Number(res.headers.get('retry-after'))
            return { status: res.status, body: parsed, retryAfterMs: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : null }
        } catch {
            throw connectError('CONNECT_NETWORK_ERROR')
        } finally {
            clearTimeout(timer)
        }
    }

    const request = async <T>(method: 'GET' | 'POST', path: string, body: unknown, retry: boolean): Promise<T> => {
        for (let attempt = 0; ; attempt++) {
            const canRetry = retry && attempt < retries
            let res: Awaited<ReturnType<typeof once>>
            try {
                res = await once(method, path, body)
            } catch (error) {
                if (!canRetry) throw error
                await sleep(backoff(attempt))
                continue
            }
            const failed = res.status >= 400 || res.body?.success === false
            if (!failed) return (res.body && 'data' in res.body ? res.body.data : res.body) as T
            if (canRetry && (res.status >= 500 || res.status === 429)) {
                await sleep(res.retryAfterMs ?? backoff(attempt))
                continue
            }
            throw apiError(res.status, res.body)
        }
    }

    return {
        /** Sessions: what to show before anyone signs in (the app's name and icon, the providers, a reconnect's account). */
        info: (token: string) =>
            request<SessionInfo>('POST', '/v2/connect/info', { token }, true),

        /** Sessions: the consent URL for one of the session's providers (each call is a new attempt). */
        authorize: (token: string, provider?: Provider) =>
            request<{ provider: Provider; url: string; expiresAt: string }>('POST', '/v2/connect/authorize', { token, ...(provider ? { provider } : {}) }, true),

        /** Sessions: the code and state the provider sent back, for the connected account. */
        complete: (token: string, code: string, state: string) =>
            request<ConnectedAccount>('POST', '/v2/connect/complete', { token, code, state }, false),

        /** Sessions, redirect mode: where to send the whole page. */
        redirectUrl: (token: string, provider?: Provider) =>
            `${base}/v2/connect/go?${new URLSearchParams({ token, ...(provider ? { provider } : {}) }).toString()}`,

        /** 1.x keys: the consent URL. */
        legacyInit: async (p: { provider: Provider; clientId: string; tokenName: string; state?: string; email?: string }) => {
            const query = new URLSearchParams({
                provider: p.provider, clientId: p.clientId, tokenName: p.tokenName, redirectUrl: `${base}/oauth/callback`,
                ...(p.state ? { state: p.state } : {}), ...(p.email ? { email: p.email } : {}),
            })
            const data = await request<{ url?: string }>('GET', `/oauth/init?${query.toString()}`, undefined, true)
            if (!data?.url) throw new ConnectError({ code: 'CONNECT_PROVIDER_ERROR', message: 'Pyas did not return a sign-in address.', retryable: true })
            return data.url
        },

        /** 1.x keys: the code, for the connected account. */
        legacyConnect: async (p: { provider: Provider; clientId: string; tokenName: string; code: string; name?: string }) => {
            const query = new URLSearchParams({ provider: p.provider, clientId: p.clientId, tokenName: p.tokenName })
            const data = await request<{ account: ConnectedAccount }>('POST', `/oauth/init/connect?${query.toString()}`, { code: p.code, name: p.name, redirectUrl: `${base}/oauth/callback` }, false)
            return data.account
        },

        /** The API's origin: the only one the callback page may post from. */
        origin: new URL(base).origin,
    }
}

export type ConnectApi = ReturnType<typeof createApi>

/** 400 ms, 1.2 s, 3.6 s ... with jitter, at most 8 seconds. */
const backoff = (attempt: number) => Math.min(8_000, 400 * 3 ** attempt) * (0.75 + Math.random() * 0.5)
