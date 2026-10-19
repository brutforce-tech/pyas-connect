import { describe, it, expect, vi } from 'vitest'
import { h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { PyasConnect } from './PyasConnect'

// The element itself is @pyas/connect's (tested there): a stand-in here.
vi.mock('@pyas/connect/dist/components/pyas-connect.js', () => ({}))

type El = HTMLElement & Record<string, unknown>

describe('PyasConnect for Vue', () => {
    it('renders the element with every prop as a property, and leaves unset ones to the element', async () => {
        const getSessionToken = async () => 'pcs_x'
        const w = mount(PyasConnect, { props: { sessionToken: 'pcs_1', getSessionToken, strings: { trigger: 'Link' }, showZoom: false }, slots: { default: 'Connect' } })
        await nextTick()
        const el = w.element as El
        expect(el.tagName.toLowerCase()).toBe('pyas-connect')
        expect(el.sessionToken).toBe('pcs_1')
        expect(el.getSessionToken).toBe(getSessionToken)
        expect(el.strings).toEqual({ trigger: 'Link' })
        expect(el.showZoom).toBe(false)
        // Not given: the element keeps its own default (Vue would otherwise send false).
        expect('showGoogle' in el).toBe(false)
        expect(el.textContent).toBe('Connect')
        await w.setProps({ sessionToken: 'pcs_2' })
        expect(el.sessionToken).toBe('pcs_2')
    })

    it('events carry the event data, new names and 1.x names alike', async () => {
        const w = mount(PyasConnect, { props: { clientId: 'c', tokenName: 't' } })
        await nextTick()
        const account = { accountId: 'acc-1', provider: 'google', email: 'ana@acme.test', name: 'Ana', subjectId: null }
        w.element.dispatchEvent(new CustomEvent('connected', { detail: account }))
        w.element.dispatchEvent(new CustomEvent('accountConnected', { detail: account }))
        w.element.dispatchEvent(new CustomEvent('connectError', { detail: { code: 'CONNECT_TIMEOUT', message: 'x' } }))
        w.element.dispatchEvent(new CustomEvent('cancel'))
        expect(w.emitted('connected')).toEqual([[account]])
        expect(w.emitted('accountConnected')).toEqual([[account]])
        expect(w.emitted('connectError')).toEqual([[{ code: 'CONNECT_TIMEOUT', message: 'x' }]])
        expect(w.emitted('cancel')).toHaveLength(1)
    })

    it('open() and close() reach the element', async () => {
        const handle = ref<{ open(): Promise<void>; close(): Promise<void> } | null>(null)
        const w = mount({ render: () => h(PyasConnect, { ref: handle, sessionToken: 'pcs_1', hideTrigger: true }) })
        await nextTick()
        const el = w.element as El
        el.open = vi.fn(async () => {})
        el.close = vi.fn(async () => {})
        await handle.value!.open()
        await handle.value!.close()
        expect(el.open).toHaveBeenCalled()
        expect(el.close).toHaveBeenCalled()
    })
})
