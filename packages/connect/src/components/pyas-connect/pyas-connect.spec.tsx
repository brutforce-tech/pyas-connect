import { newSpecPage } from '@stencil/core/testing'

/*
 * The element over a stand-in flow: each screen of the design, and the events
 * the page receives. The flow itself is tested in @pyas/connect-core.
 */
const base = { status: 'choosing', providers: ['google', 'microsoft'], app: { name: 'Acme Scheduling', iconUrl: null }, reconnect: null, provider: null, account: null, error: null, windowMaybeClosed: false, slow: false }

const flows: any[] = []
jest.mock('@pyas/connect-core', () => ({
    createConnectFlow: (opts: any) => {
        let snap: any = { ...base, status: 'loading' }
        const listeners = new Set<(s: any) => void>()
        const flow = {
            opts,
            set(patch: any) { snap = { ...snap, ...patch }; listeners.forEach((l) => l(snap)) },
            getSnapshot: () => snap,
            subscribe(l: any) { listeners.add(l); return () => listeners.delete(l) },
            start: jest.fn(async () => {}),
            choose: jest.fn(),
            retry: jest.fn(),
            reopen: jest.fn(),
            back: jest.fn(),
            cancel: jest.fn(() => opts.onCancel?.()),
            destroy: jest.fn(),
        }
        flows.push(flow)
        return flow
    },
    postCallbackResult: () => false,
}))

import { PyasConnect } from './pyas-connect'

const page = async (html = '<pyas-connect session-token="pcs_t"></pyas-connect>') => {
    flows.length = 0
    const p = await newSpecPage({ components: [PyasConnect], html })
    const el = p.root as HTMLElement & { open(): Promise<void>; close(): Promise<void> }
    const events: Record<string, any[]> = {}
    for (const name of ['connected', 'error', 'cancel', 'accountConnected', 'connectError']) {
        events[name] = []
        el.addEventListener(name, (e: any) => events[name].push(e.detail))
    }
    const shadow = () => el.shadowRoot!
    const text = () => shadow().textContent!.replace(/\s+/g, ' ')
    const buttons = () => Array.from(shadow().querySelectorAll('button')).map((b) => b.textContent!.trim())
    const click = async (label: string) => {
        const b = Array.from(shadow().querySelectorAll('button')).find((x) => x.textContent!.trim() === label || x.getAttribute('aria-label') === label)
        if (!b) throw new Error(`no button "${label}" in: ${buttons().join(' | ')}`)
        b.click()
        await p.waitForChanges()
    }
    const set = async (patch: any) => { flows[flows.length - 1].set(patch); await p.waitForChanges() }
    return { p, el, events, shadow, text, buttons, click, set, flow: () => flows[flows.length - 1] }
}

describe('<pyas-connect>', () => {
    it('a trigger opens a labelled modal dialog on the chooser, the developer\'s name first, Pyas in the footer', async () => {
        const t = await page()
        expect(t.buttons()).toEqual(['Connect a calendar'])
        await t.click('Connect a calendar')
        expect(t.flow().opts).toMatchObject({ session: 'pcs_t', providers: ['google', 'microsoft', 'zoom'] })
        expect(t.flow().start).toHaveBeenCalled()
        await t.set({ status: 'choosing' })
        const dialog = t.shadow().querySelector('[role="dialog"]')!
        expect(dialog.getAttribute('aria-modal')).toBe('true')
        expect(t.shadow().getElementById(dialog.getAttribute('aria-labelledby')!)!.textContent).toBe('Connect your calendar')
        expect(t.text()).toContain('Acme Scheduling sees only what you allow on the next screen.')
        expect(t.buttons()).toEqual(expect.arrayContaining(['Continue with Google', 'Continue with Microsoft']))
        expect(t.shadow().querySelector('.footer')!.textContent).toContain('Secured by Pyas')
        await t.click('Continue with Google')
        expect(t.flow().choose).toHaveBeenCalledWith('google')
    })

    it('a reconnect names the account and goes straight to its provider', async () => {
        const t = await page()
        await t.click('Connect a calendar')
        await t.set({ status: 'choosing', provider: 'microsoft', reconnect: { email: 'bo@contoso.test', provider: 'microsoft' } })
        expect(t.text()).toContain('Reconnect your calendar')
        expect(t.text()).toContain('Your Microsoft connection for bo@contoso.test stopped working.')
        await t.click('Reconnect Microsoft')
        expect(t.flow().choose).toHaveBeenCalledWith('microsoft')
    })

    it('waiting names the window and offers it again; after the wait it asks whether they are still there', async () => {
        const t = await page()
        await t.click('Connect a calendar')
        await t.set({ status: 'waiting', provider: 'google' })
        expect(t.text()).toContain('Continue in Google')
        expect(t.text()).toContain('Allow access in the window that opened, then come back.')
        await t.click('No window? Open it again')
        expect(t.flow().reopen).toHaveBeenCalled()
        await t.set({ slow: true })
        expect(t.text()).toContain('Still there? The window may be behind this one.')
        expect(t.buttons()).toEqual(expect.arrayContaining(['Open it again', 'Start over']))
        await t.set({ slow: false, windowMaybeClosed: true })
        expect(t.text()).toContain('Did the window close?')
        await t.click('Choose another calendar')
        expect(t.flow().back).toHaveBeenCalled()
    })

    it('connected shows which account, and the page hears at once (1.x event too)', async () => {
        const t = await page()
        await t.click('Connect a calendar')
        const account = { accountId: 'acc-1', provider: 'google', email: 'ana@acme.test', name: 'Ana', subjectId: 'u1' }
        t.flow().opts.onConnected(account)
        await t.set({ status: 'connected', provider: 'google', account })
        expect(t.text()).toContain('Calendar connected')
        expect(t.text()).toContain('ana@acme.test')
        expect(t.text()).toContain('Google Calendar')
        expect(t.events.connected).toEqual([{ accountId: 'acc-1', provider: 'google', email: 'ana@acme.test', name: 'Ana', subjectId: 'u1' }])
        expect(t.events.accountConnected[0]).toMatchObject({ accountId: 'acc-1' })
        await t.click('Done')
        expect(t.shadow().querySelector('[role="dialog"]')).toBeNull()
        expect(t.events.cancel).toHaveLength(0)
    })

    it('a refusal offers a way forward and is reported only if they give up', async () => {
        const t = await page()
        await t.click('Connect a calendar')
        const denied = { code: 'CONNECT_CONSENT_DENIED', message: 'Access was not allowed.', retryable: true }
        t.flow().opts.onError(denied)
        await t.set({ status: 'failed', provider: 'google', error: denied })
        expect(t.text()).toContain("Access wasn't granted")
        expect(t.text()).toContain("Google didn't share your calendar.")
        expect(t.events.error).toHaveLength(0)
        await t.click('Try again')
        expect(t.flow().retry).toHaveBeenCalled()

        t.flow().opts.onError(denied)
        await t.set({ status: 'failed', error: denied })
        await t.click('Close')
        expect(t.events.error).toEqual([denied])
        expect(t.events.connectError).toEqual([{ message: denied.message, code: denied.code }])
    })

    it('an expired session is reported at once (the page makes a new one), and never shows the API\'s words', async () => {
        const t = await page()
        await t.click('Connect a calendar')
        const expired = { code: 'AUTH_INVALID_CONNECT_SESSION', message: 'The connect session is missing, invalid, expired or already used.', retryable: false }
        t.flow().opts.onError(expired)
        await t.set({ status: 'failed', error: expired })
        expect(t.events.error).toEqual([expired])
        expect(t.text()).toContain('This sign-in link has expired')
        expect(t.text()).not.toContain('missing, invalid')
        expect(t.buttons()).toContain('Close')
        expect(t.buttons()).not.toContain('Try again')
    })

    it('closing without connecting is a cancel; Escape closes too and focus goes back', async () => {
        const t = await page()
        await t.click('Connect a calendar')
        await t.set({ status: 'choosing' })
        const dialog = t.shadow().querySelector('.dialog') as HTMLElement
        dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await t.p.waitForChanges()
        expect(t.shadow().querySelector('[role="dialog"]')).toBeNull()
        expect(t.events.cancel).toHaveLength(1)
        expect(flows[0].destroy).toHaveBeenCalled()
    })

    it('inline: in the page, no trigger, no close; started on load', async () => {
        const t = await page('<pyas-connect display="inline" session-token="pcs_t"></pyas-connect>')
        expect(t.flow().start).toHaveBeenCalled()
        await t.set({ status: 'choosing' })
        expect(t.shadow().querySelector('[role="region"]')).not.toBeNull()
        expect(t.buttons()).not.toContain('Connect a calendar')
        expect(t.shadow().querySelector('.close')).toBeNull()
    })

    it('words can be replaced (translations), and 1.x props still apply', async () => {
        const t = await page(`<pyas-connect session-token="pcs_t" modal-title="Link your calendar" show-zoom="false" strings='{"trigger":"Kalender verbinden"}'></pyas-connect>`)
        expect(t.buttons()).toEqual(['Kalender verbinden'])
        await t.click('Kalender verbinden')
        expect(t.flow().opts.providers).toEqual(['google', 'microsoft'])
        await t.set({ status: 'choosing' })
        expect(t.text()).toContain('Link your calendar')
    })

    it('1.x keys: the flow gets them, and a page without a name asks for one first', async () => {
        const t = await page('<pyas-connect client-id="client-1" token-name="web" product-name="Acme"></pyas-connect>')
        await t.click('Connect a calendar')
        expect(t.flow().opts.legacy).toMatchObject({ clientId: 'client-1', tokenName: 'web' })
        expect(t.flow().opts.session).toBeUndefined()
        await t.set({ status: 'choosing', app: null })
        expect(t.text()).toContain('Acme sees only what you allow')
        await t.click('Continue with Google')
        expect(t.text()).toContain('Your details')
        // The test DOM does not submit a form from its button; a browser does.
        const submit = async () => { t.shadow().querySelector('form')!.dispatchEvent(new Event('submit')); await t.p.waitForChanges() }
        await submit()
        expect(t.text()).toContain('Enter your name.')
        expect(t.flow().choose).not.toHaveBeenCalled()
        const input = t.shadow().querySelector('input')!
        input.value = 'Ana Silva'
        input.dispatchEvent(new Event('input'))
        await t.p.waitForChanges()
        await submit()
        expect(t.flow().opts.legacy.name).toBe('Ana Silva')
        expect(t.flow().choose).toHaveBeenCalledWith('google')
    })
})
