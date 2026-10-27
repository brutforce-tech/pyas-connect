import { createElement, forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties, type ReactNode } from 'react'
import type { ConnectErrorInfo, PyasConnectStrings } from '@pyas/connect'

/**
 * PyasConnect for React: the <pyas-connect> element, with React props and
 * callbacks. No UI of its own: one element serves every framework.
 *
 *   <PyasConnect sessionToken={token} onConnected={(account) => save(account.accountId)} />
 *
 * Callbacks receive the event's data, as 1.x's did, so 1.x code (`clientId`,
 * `tokenName`, `onAccountConnected`, `onConnectError`) keeps working.
 */

export interface ConnectedAccount {
    accountId: string
    provider: string
    email: string
    name: string | null
    subjectId: string | null
}

export interface PyasConnectProps {
    /** A connect session's token, made on your server (`POST /v2/connect/sessions`). */
    sessionToken?: string
    /** Or a function that fetches a new one: then every failure can be tried again in place. */
    getSessionToken?: () => Promise<string>
    providers?: string | string[]
    apiUrl?: string
    mode?: 'popup' | 'redirect'
    display?: 'dialog' | 'inline'
    theme?: 'light' | 'dark' | 'auto'
    strings?: Partial<PyasConnectStrings>
    hideTrigger?: boolean
    callbackOrigins?: string
    onConnected?: (account: ConnectedAccount) => void
    onError?: (error: ConnectErrorInfo) => void
    onCancel?: () => void

    /* 1.x */
    clientId?: string
    tokenName?: string
    userName?: string
    userEmail?: string
    productName?: string
    state?: string
    modalTitle?: string
    modalDescription?: string
    formTitle?: string
    formDescription?: string
    showGoogle?: boolean
    showOutlook?: boolean
    showZoom?: boolean
    showLabels?: boolean
    showIcloud?: boolean
    showDisclaimer?: boolean
    onAccountConnected?: (account: ConnectedAccount & Record<string, unknown>) => void
    onConnectError?: (error: { message: string; code: string }) => void

    /** The trigger button's text. */
    children?: ReactNode
    className?: string
    style?: CSSProperties
}

export interface PyasConnectHandle {
    /** Opens the dialog. Call it from a click. */
    open(): Promise<void>
    close(): Promise<void>
}

/** Props passed to the element as properties (objects and functions too). */
const PROPS = [
    'sessionToken', 'getSessionToken', 'providers', 'apiUrl', 'mode', 'display', 'theme', 'strings', 'hideTrigger', 'callbackOrigins',
    'clientId', 'tokenName', 'userName', 'userEmail', 'productName', 'state', 'modalTitle', 'modalDescription', 'formTitle', 'formDescription',
    'showGoogle', 'showOutlook', 'showZoom', 'showLabels', 'showIcloud', 'showDisclaimer',
] as const

/** The element's events, and the callback each one calls with its data. */
const EVENTS = {
    connected: 'onConnected',
    error: 'onError',
    cancel: 'onCancel',
    accountConnected: 'onAccountConnected',
    connectError: 'onConnectError',
} as const

type ElementWithMethods = HTMLElement & PyasConnectHandle & Record<string, unknown>

/** Defines <pyas-connect> once, in the browser only (server rendering never touches customElements). */
let defining: Promise<unknown> | null = null
export const definePyasConnect = () => (defining ??= import('@pyas/connect/dist/components/pyas-connect.js'))

export const PyasConnect = forwardRef<PyasConnectHandle, PyasConnectProps>(function PyasConnect(props, ref) {
    const element = useRef<ElementWithMethods | null>(null)
    const latest = useRef(props)
    latest.current = props

    useImperativeHandle(ref, () => ({
        open: async () => { await definePyasConnect(); await element.current?.open() },
        close: async () => { await element.current?.close() },
    }), [])

    useEffect(() => { void definePyasConnect() }, [])

    // Every prop, as a property: strings, objects and functions alike.
    useEffect(() => {
        const el = element.current
        if (!el) return
        for (const name of PROPS) {
            const value = props[name]
            if (value !== undefined) el[name] = value as unknown
        }
    })

    // Each event, to the latest callback, with the event's data.
    useEffect(() => {
        const el = element.current
        if (!el) return
        const off = Object.entries(EVENTS).map(([event, callback]) => {
            const listener = (e: Event) => {
                const fn = latest.current[callback] as ((detail?: unknown) => void) | undefined
                fn?.((e as CustomEvent).detail)
            }
            el.addEventListener(event, listener)
            return () => el.removeEventListener(event, listener)
        })
        return () => off.forEach((f) => f())
    }, [])

    return createElement('pyas-connect', { ref: element, class: props.className, style: props.style }, props.children)
})
