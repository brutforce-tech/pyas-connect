/**
 * Failures as the widget reports them: a code, a message a person can read,
 * and whether trying again can work. Codes, never message text, are what code
 * branches on.
 *
 * `CONNECT_*` codes are the widget's own (they are in the API's error
 * registry, with a docs page each). A failure the API answered with keeps the
 * API's own code (`AUTH_ORIGIN_NOT_ALLOWED`, `CONNECTION_CONSENT_FAILED`, ...).
 */

export type ConnectErrorCode =
    | 'CONNECT_TIMEOUT'
    | 'CONNECT_CONSENT_DENIED'
    | 'CONNECT_POPUP_BLOCKED'
    | 'CONNECT_CANCELLED'
    | 'CONNECT_NETWORK_ERROR'
    | 'CONNECT_PROVIDER_ERROR'
    | 'CONNECT_INVALID_CONFIG'

export interface ConnectErrorInfo {
    /** A `CONNECT_*` code, or the API's own code for a failure it answered with. */
    code: string
    message: string
    retryable: boolean
    /** The API's trace id, when the API answered: quote it to support. */
    traceId?: string | null
}

export class ConnectError extends Error implements ConnectErrorInfo {
    readonly code: string
    readonly retryable: boolean
    readonly traceId: string | null

    constructor(info: ConnectErrorInfo) {
        super(info.message)
        this.name = 'ConnectError'
        this.code = info.code
        this.retryable = info.retryable
        this.traceId = info.traceId ?? null
    }

    toJSON(): ConnectErrorInfo {
        return { code: this.code, message: this.message, retryable: this.retryable, traceId: this.traceId }
    }
}

const MESSAGES: Record<ConnectErrorCode, { message: string; retryable: boolean }> = {
    CONNECT_TIMEOUT: { message: 'The sign-in took too long. Try again.', retryable: true },
    CONNECT_CONSENT_DENIED: { message: 'Access was not allowed, so the calendar was not connected.', retryable: true },
    CONNECT_POPUP_BLOCKED: { message: 'Your browser blocked the sign-in window. Allow pop-ups for this site, then try again.', retryable: true },
    CONNECT_CANCELLED: { message: 'The connection was cancelled.', retryable: true },
    CONNECT_NETWORK_ERROR: { message: 'Pyas could not be reached. Check your connection and try again.', retryable: true },
    CONNECT_PROVIDER_ERROR: { message: 'The calendar provider could not finish the sign-in. Try again.', retryable: true },
    CONNECT_INVALID_CONFIG: { message: 'This connect button is not set up correctly.', retryable: false },
}

export const connectError = (code: ConnectErrorCode, message?: string): ConnectError =>
    new ConnectError({ code, message: message ?? MESSAGES[code].message, retryable: MESSAGES[code].retryable })

/** API codes a new attempt cannot fix: the session is spent, or the setup is wrong. */
const FINAL_API_CODES = new Set([
    'AUTH_INVALID_CONNECT_SESSION', 'AUTH_ORIGIN_NOT_ALLOWED', 'AUTH_INVALID_KEY', 'AUTH_SANDBOX_MISMATCH', 'VALIDATION_INVALID_BODY',
    'CONNECTION_PROVIDER_NOT_CONFIGURED', 'BILLING_SUBSCRIPTION_REQUIRED', 'BILLING_CONNECTION_LIMIT',
])

/** A failure the API answered with, as a ConnectError keeping the API's code. */
export const apiError = (status: number, body: unknown): ConnectError => {
    const err = (body && typeof body === 'object' ? (body as any).error : null) ?? null
    const code: string = typeof err?.code === 'string' ? err.code : status >= 500 ? 'CONNECT_NETWORK_ERROR' : 'CONNECT_PROVIDER_ERROR'
    const message: string = typeof err?.message === 'string' ? err.message
        : typeof err === 'string' ? err
            : status >= 500 ? MESSAGES.CONNECT_NETWORK_ERROR.message : MESSAGES.CONNECT_PROVIDER_ERROR.message
    // A spent or expired session needs a new one from the developer's server: not retryable here.
    const retryable = status >= 500 || status === 429 || (!FINAL_API_CODES.has(code) && status !== 401 && status !== 403 && status !== 400)
    return new ConnectError({ code, message, retryable, traceId: err?.traceId ?? (body as any)?.traceId ?? null })
}
