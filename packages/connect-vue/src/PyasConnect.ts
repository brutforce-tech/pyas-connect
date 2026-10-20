import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'
import type { ConnectErrorInfo, PyasConnectStrings } from '@pyas/connect'

/**
 * PyasConnect for Vue: the <pyas-connect> element, with Vue props and events.
 * No UI of its own (plan §59): one element serves every framework.
 *
 *   <PyasConnect :session-token="token" @connected="(account) => save(account.accountId)" />
 *
 * Events carry the event's data, as 1.x's did, so 1.x code (`client-id`,
 * `token-name`, `@accountConnected`, `@connectError`) keeps working.
 */

export interface ConnectedAccount {
    accountId: string
    provider: string
    email: string
    name: string | null
    subjectId: string | null
}

const optional = <T>(type: PropType<T>) => ({ type, default: undefined })

/** Props passed to the element as properties (objects and functions too). */
const props = {
    sessionToken: optional(String),
    getSessionToken: optional(Function as PropType<() => Promise<string>>),
    providers: optional([String, Array] as PropType<string | string[]>),
    apiUrl: optional(String),
    mode: optional(String as PropType<'popup' | 'redirect'>),
    display: optional(String as PropType<'dialog' | 'inline'>),
    theme: optional(String as PropType<'light' | 'dark' | 'auto'>),
    strings: optional(Object as PropType<Partial<PyasConnectStrings>>),
    hideTrigger: optional(Boolean),
    callbackOrigins: optional(String),
    /* 1.x */
    clientId: optional(String),
    tokenName: optional(String),
    userName: optional(String),
    userEmail: optional(String),
    productName: optional(String),
    state: optional(String),
    modalTitle: optional(String),
    modalDescription: optional(String),
    formTitle: optional(String),
    formDescription: optional(String),
    showGoogle: optional(Boolean),
    showOutlook: optional(Boolean),
    showZoom: optional(Boolean),
    showLabels: optional(Boolean),
    showIcloud: optional(Boolean),
    showDisclaimer: optional(Boolean),
}

const EVENTS = ['connected', 'error', 'cancel', 'accountConnected', 'connectError'] as const

type ElementWithMethods = HTMLElement & { open(): Promise<void>; close(): Promise<void> } & Record<string, unknown>

/** Defines <pyas-connect> once, in the browser only (server rendering never touches customElements). */
let defining: Promise<unknown> | null = null
export const definePyasConnect = () => (defining ??= import('@pyas/connect/dist/components/pyas-connect.js'))

export const PyasConnect = defineComponent({
    name: 'PyasConnect',
    props,
    emits: {
        connected: (_account: ConnectedAccount) => true,
        error: (_error: ConnectErrorInfo) => true,
        cancel: () => true,
        accountConnected: (_account: ConnectedAccount & Record<string, unknown>) => true,
        connectError: (_error: { message: string; code: string }) => true,
    },
    setup(p, { emit, slots, expose }) {
        const element = ref<ElementWithMethods | null>(null)

        const apply = () => {
            const el = element.value
            if (!el) return
            for (const name of Object.keys(props) as Array<keyof typeof props>) {
                const value = p[name]
                // Booleans Vue defaults to false only when absent; undefined leaves the element's own default.
                if (value !== undefined) el[name] = value as unknown
            }
        }
        watch(() => ({ ...p }), apply, { deep: true })

        const listeners = EVENTS.map((name) => [name, (e: Event) => (emit as (n: string, d?: unknown) => void)(name, (e as CustomEvent).detail)] as const)
        onMounted(() => {
            void definePyasConnect()
            apply()
            for (const [name, listener] of listeners) element.value?.addEventListener(name, listener)
        })
        onBeforeUnmount(() => {
            for (const [name, listener] of listeners) element.value?.removeEventListener(name, listener)
        })

        expose({
            /** Opens the dialog. Call it from a click. */
            open: async () => { await definePyasConnect(); await element.value?.open() },
            close: async () => { await element.value?.close() },
        })

        return () => h('pyas-connect', { ref: element }, slots.default?.())
    },
})
