import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { API_URL, examplePath, makeSession, seedState } from './support/env'
import { playProviders } from './support/provider'

/**
 * Every state of the dialog, as a person sees it: a screenshot against the
 * baseline, and axe (WCAG 2.2 AA) on the element. The element is the same in
 * every framework, so this runs in the React example only.
 */

test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'react', 'The element is the same in every framework.')
})

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/** The screenshot, then axe on the widget: no violations at all. */
const check = async (page: Page, name: string) => {
    // No hover left over from the last click; the page's event log holds ids that change every run.
    await page.mouse.move(1, 1)
    await expect(page).toHaveScreenshot(`${name}.png`, { mask: [page.getByTestId('events')] })
    const results = await new AxeBuilder({ page }).include('pyas-connect').withTags(WCAG).analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([])
}

const open = async (page: Page) => {
    await page.getByRole('button', { name: 'Connect an account' }).click()
    await expect(page.getByRole('dialog', { name: 'Connect an account' })).toBeVisible()
    await expect(page.getByRole('dialog')).toContainText(seedState().appName)
    return page.getByRole('dialog')
}

test('the trigger, in the page', async ({ page, request }) => {
    await page.goto(examplePath({ token: await makeSession(request) }))
    await expect(page.getByRole('button', { name: 'Connect an account' })).toBeVisible()
    await check(page, 'trigger')
})

test('choosing a calendar, light', async ({ page, request }) => {
    await page.goto(examplePath({ token: await makeSession(request) }))
    await open(page)
    await check(page, 'choosing-light')
})

test('choosing a calendar, dark', async ({ page, request }) => {
    await page.goto(examplePath({ token: await makeSession(request), theme: 'dark' }))
    await open(page)
    await check(page, 'choosing-dark')
})

test('choosing a calendar, auto on a dark system', async ({ page, request }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(examplePath({ token: await makeSession(request), theme: 'auto' }))
    await open(page)
    await check(page, 'choosing-auto-dark')
})

test.describe('on a phone', () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

    test('choosing a calendar', async ({ page, request }) => {
        await page.goto(examplePath({ token: await makeSession(request) }))
        await open(page)
        await check(page, 'phone-choosing')
    })

    test('connected', async ({ page, context, request }) => {
        await playProviders(context)
        await page.goto(examplePath({ token: await makeSession(request) }))
        const dialog = await open(page)
        const popup = page.waitForEvent('popup')
        await dialog.getByRole('button', { name: 'Google Calendar' }).click()
        await (await popup).getByRole('button', { name: 'Allow' }).click()
        await expect(dialog.getByRole('heading', { name: 'Account connected' })).toBeVisible()
        await check(page, 'phone-connected')
    })
})

test('inline, in the page', async ({ page, request }) => {
    await page.goto(examplePath({ token: await makeSession(request), display: 'inline' }))
    await expect(page.getByRole('heading', { name: 'Connect an account' })).toBeVisible()
    await expect(page.locator('pyas-connect')).toContainText(seedState().appName)
    await check(page, 'inline')
})

test('waiting for the sign-in window, then "still there?"', async ({ page, context, request }) => {
    await page.clock.install()
    await playProviders(context)
    await page.goto(examplePath({ token: await makeSession(request) }))
    const dialog = await open(page)
    const popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Google Calendar' }).click()
    await popup
    await expect(dialog.getByRole('heading', { name: 'Continue in Google' })).toBeVisible()
    await page.bringToFront()
    await check(page, 'waiting')

    await page.clock.runFor(61_000)
    await expect(dialog).toContainText('Still there?')
    await check(page, 'still-there')
})

test('the provider refused', async ({ page, context, request }) => {
    await playProviders(context)
    await page.goto(examplePath({ token: await makeSession(request) }))
    const dialog = await open(page)
    const popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Google Calendar' }).click()
    await (await popup).getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog.getByRole('heading', { name: "Access wasn't granted" })).toBeVisible()
    await check(page, 'denied')
})

test('connected', async ({ page, context, request }) => {
    const provider = await playProviders(context)
    provider.signInAs({ email: 'maria@example.test', name: 'Maria Lopez' })
    await page.goto(examplePath({ token: await makeSession(request) }))
    const dialog = await open(page)
    const popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Google Calendar' }).click()
    await (await popup).getByRole('button', { name: 'Allow' }).click()
    await expect(dialog.getByRole('heading', { name: 'Account connected' })).toBeVisible()
    await check(page, 'connected')
})

test('the browser blocked the sign-in window', async ({ page, request }) => {
    await page.addInitScript(() => { window.open = () => null })
    await page.goto(examplePath({ token: await makeSession(request) }))
    const dialog = await open(page)
    await dialog.getByRole('button', { name: 'Google Calendar' }).click()
    await expect(dialog.getByRole('heading', { name: 'Your browser blocked the sign-in window' })).toBeVisible()
    await check(page, 'popup-blocked')
})

test('an expired session', async ({ page }) => {
    await page.goto(examplePath({ token: 'pcs_not-a-real-session' }))
    await page.getByRole('button', { name: 'Connect an account' }).click()
    await expect(page.getByRole('heading', { name: 'This sign-in link has expired' })).toBeVisible()
    await check(page, 'expired')
})

test('1.x: the details screen, with its errors', async ({ page }) => {
    const { clientId, tokenName } = seedState()
    await page.goto(examplePath({ clientId, tokenName }))
    await page.getByRole('button', { name: 'Connect an account' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Google Calendar' }).click()
    await expect(dialog.getByRole('heading', { name: 'Your details' })).toBeVisible()
    await check(page, 'details')
    await dialog.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(dialog).toContainText('Enter your email address.')
    await expect(dialog.getByLabel('Name')).toBeFocused()
    await check(page, 'details-errors')
})

test('reconnecting an account', async ({ page, request }) => {
    // Reconnect sessions come from links; the API's answer for one, as the widget reads it.
    await page.route(`${API_URL}/v2/connect/info`, (route) => route.fulfill({
        json: { success: true, data: { app: { name: seedState().appName, iconUrl: null }, providers: ['google'], reconnect: { email: 'maria@example.test', provider: 'google' }, loginHint: 'maria@example.test', expiresAt: new Date(Date.now() + 600_000).toISOString() } },
    }))
    await page.goto(examplePath({ token: await makeSession(request) }))
    await page.getByRole('button', { name: 'Connect an account' }).click()
    await expect(page.getByRole('heading', { name: 'Reconnect your account' })).toBeVisible()
    await check(page, 'reconnect')
})

test('keyboard: focus moves into the dialog, stays there, and Escape returns it', async ({ page, request }) => {
    await page.goto(examplePath({ token: await makeSession(request) }))
    const trigger = page.getByRole('button', { name: 'Connect an account' })
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText(seedState().appName)
    const inside = () => page.evaluate(() => {
        const el = document.querySelector('pyas-connect')!
        return !!el.shadowRoot?.activeElement && !!el.shadowRoot.activeElement.closest('[role="dialog"]')
    })
    expect(await inside()).toBe(true)
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab')
        expect(await inside()).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
})
