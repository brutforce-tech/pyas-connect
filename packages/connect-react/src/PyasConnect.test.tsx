import { describe, it, expect, vi } from 'vitest'
import { createRef } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { PyasConnect, type PyasConnectHandle } from './PyasConnect'

// The element itself is @pyas/connect's (tested there): a stand-in here.
vi.mock('@pyas/connect/dist/components/pyas-connect.js', () => ({}))

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const mount = async (ui: React.ReactElement) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => { root.render(ui) })
    return { el: host.querySelector('pyas-connect') as unknown as HTMLElement & Record<string, unknown>, root }
}

describe('PyasConnect for React', () => {
    it('renders the element with every prop as a property, functions and objects included', async () => {
        const getSessionToken = async () => 'pcs_x'
        const { el } = await mount(<PyasConnect sessionToken="pcs_1" getSessionToken={getSessionToken} strings={{ trigger: 'Link' }} theme="auto" showZoom={false}>Connect</PyasConnect>)
        expect(el).not.toBeNull()
        expect(el.sessionToken).toBe('pcs_1')
        expect(el.getSessionToken).toBe(getSessionToken)
        expect(el.strings).toEqual({ trigger: 'Link' })
        expect(el.theme).toBe('auto')
        expect(el.showZoom).toBe(false)
        expect(el.textContent).toBe('Connect')
    })

    it('callbacks get the event data, new names and 1.x names alike, and always the latest callback', async () => {
        const first = vi.fn()
        const onAccountConnected = vi.fn()
        const onConnectError = vi.fn()
        const onCancel = vi.fn()
        const { el, root } = await mount(<PyasConnect clientId="c" tokenName="t" onConnected={first} onAccountConnected={onAccountConnected} onConnectError={onConnectError} onCancel={onCancel} />)
        const later = vi.fn()
        await act(async () => { root.render(<PyasConnect clientId="c" tokenName="t" onConnected={later} onAccountConnected={onAccountConnected} onConnectError={onConnectError} onCancel={onCancel} />) })
        const account = { accountId: 'acc-1', provider: 'google', email: 'ana@acme.test', name: 'Ana', subjectId: null }
        el.dispatchEvent(new CustomEvent('connected', { detail: account }))
        el.dispatchEvent(new CustomEvent('accountConnected', { detail: account }))
        el.dispatchEvent(new CustomEvent('connectError', { detail: { code: 'CONNECT_TIMEOUT', message: 'x' } }))
        el.dispatchEvent(new CustomEvent('cancel'))
        expect(first).not.toHaveBeenCalled()
        expect(later).toHaveBeenCalledWith(account)
        expect(onAccountConnected).toHaveBeenCalledWith(account)
        expect(onConnectError).toHaveBeenCalledWith({ code: 'CONNECT_TIMEOUT', message: 'x' })
        expect(onCancel).toHaveBeenCalled()
        expect(el.clientId).toBe('c')
    })

    it('open() and close() reach the element', async () => {
        const ref = createRef<PyasConnectHandle>()
        const { el } = await mount(<PyasConnect ref={ref} sessionToken="pcs_1" hideTrigger />)
        el.open = vi.fn(async () => {})
        el.close = vi.fn(async () => {})
        await ref.current!.open()
        await ref.current!.close()
        expect(el.open).toHaveBeenCalled()
        expect(el.close).toHaveBeenCalled()
    })
})
