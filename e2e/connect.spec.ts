import { expect, test, type Page } from '@playwright/test'
import { examplePath, makeSession, seedState } from './support/env'
import { playProviders } from './support/provider'

/**
 * What a person does with the widget, in each framework's example app (the
 * projects: react, vue, angular), against the real API.
 */

const events = (page: Page, name: string) => page.locator(`[data-testid="events"] li[data-event="${name}"]`)

const openWidget = async (page: Page) => {
    await page.getByRole('button', { name: 'Connect an account' }).click()
    // Named after its current heading, so found without the name once open.
    await expect(page.getByRole('dialog', { name: 'Connect an account' })).toBeVisible()
    return page.getByRole('dialog')
}

test('connects a Google calendar, and the page hears about it', async ({ page, context, request }) => {
    const provider = await playProviders(context)
    provider.signInAs({ email: 'maria@example.test', name: 'Maria Lopez' })
    await page.goto(examplePath({ token: await makeSession(request, { subjectId: 'user_42' }) }))

    const dialog = await openWidget(page)
    await expect(dialog).toContainText(seedState().appName)
    const popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Google Calendar' }).click()
    const signIn = await popup
    await expect(dialog.getByRole('heading', { name: 'Continue in Google' })).toBeVisible()
    await signIn.getByRole('button', { name: 'Allow' }).click()

    await expect(dialog.getByRole('heading', { name: 'Account connected' })).toBeVisible()
    await expect(dialog).toContainText('maria@example.test')
    await expect(events(page, 'connected')).toContainText('"email":"maria@example.test"')
    await expect(events(page, 'connected')).toContainText('"subjectId":"user_42"')
    // 1.x's event still comes, for pages written for 1.x.
    await expect(events(page, 'accountConnected')).toContainText('maria@example.test')
    await dialog.getByRole('button', { name: 'Done' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('list', { name: 'Connected calendars' })).toContainText('maria@example.test')
})

test('a refusal at the provider can be tried again in place', async ({ page, context, request }) => {
    await playProviders(context)
    await page.goto(examplePath({ token: await makeSession(request) }))
    const dialog = await openWidget(page)

    let popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Google Calendar' }).click()
    await (await popup).getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog.getByRole('heading', { name: "Access wasn't granted" })).toBeVisible()
    // Not sent yet: the person can still recover here.
    await expect(events(page, 'error')).toHaveCount(0)

    popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Try again' }).click()
    await (await popup).getByRole('button', { name: 'Allow' }).click()
    await expect(dialog.getByRole('heading', { name: 'Account connected' })).toBeVisible()
    await expect(events(page, 'connected')).toHaveCount(1)
})

test('giving up after a refusal sends the error to the page', async ({ page, context, request }) => {
    await playProviders(context)
    await page.goto(examplePath({ token: await makeSession(request) }))
    const dialog = await openWidget(page)
    const popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Google Calendar' }).click()
    await (await popup).getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog.getByRole('heading', { name: "Access wasn't granted" })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(events(page, 'error')).toContainText('CONNECT_CONSENT_DENIED')
    await expect(events(page, 'connectError')).toContainText('CONNECT_CONSENT_DENIED')
})

test('closing without connecting sends cancel', async ({ page, request }) => {
    await page.goto(examplePath({ token: await makeSession(request) }))
    const dialog = await openWidget(page)
    await dialog.getByRole('button', { name: 'Close' }).click()
    await expect(dialog).toBeHidden()
    await expect(events(page, 'cancel')).toHaveCount(1)
    await expect(events(page, 'error')).toHaveCount(0)
})

test('a session that was already used is reported at once', async ({ page, context, request }) => {
    await playProviders(context)
    const token = await makeSession(request)
    await page.goto(examplePath({ token }))
    let dialog = await openWidget(page)
    const popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Google Calendar' }).click()
    await (await popup).getByRole('button', { name: 'Allow' }).click()
    await expect(dialog.getByRole('heading', { name: 'Account connected' })).toBeVisible()

    // The same token on a new page: the developer's page must make a new session.
    await page.goto(examplePath({ token }))
    await page.getByRole('button', { name: 'Connect an account' }).click()
    dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'This sign-in link has expired' })).toBeVisible()
    await expect(events(page, 'error')).toContainText('AUTH_INVALID_CONNECT_SESSION')
})

test('with a session per attempt, an expired sign-in is tried again without reloading', async ({ page, context, request }) => {
    const provider = await playProviders(context)
    let made = 0
    await page.route('**/api/pyas-session', async (route) => {
        made++
        await route.fulfill({ json: { token: await makeSession(request) } })
    })
    await page.goto(examplePath({ fresh: '1' }))
    const dialog = await openWidget(page)

    provider.signInAs('e2e-expired')
    let popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Google Calendar' }).click()
    await (await popup).getByRole('button', { name: 'Allow' }).click()
    await expect(dialog.getByRole('heading', { name: "We couldn't connect your account" })).toBeVisible()

    provider.signInAs({ email: 'second@example.test', name: 'Second Try' })
    popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Try again' }).click()
    await (await popup).getByRole('button', { name: 'Allow' }).click()
    await expect(dialog.getByRole('heading', { name: 'Account connected' })).toBeVisible()
    await expect(events(page, 'connected')).toContainText('second@example.test')
    expect(made).toBeGreaterThanOrEqual(2)
})

test('opened from the page\'s own button', async ({ page, context, request }) => {
    await playProviders(context)
    await page.goto(examplePath({ token: await makeSession(request), hideTrigger: '1' }))
    await expect(page.getByRole('button', { name: 'Connect an account' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Add a calendar' }).click()
    await expect(page.getByRole('dialog', { name: 'Connect an account' })).toBeVisible()
    const dialog = page.getByRole('dialog')
    const popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Google Calendar' }).click()
    await (await popup).getByRole('button', { name: 'Allow' }).click()
    await expect(dialog.getByRole('heading', { name: 'Account connected' })).toBeVisible()
})

test('1.x keys (client id and token name) still connect', async ({ page, context }) => {
    const provider = await playProviders(context)
    provider.signInAs({ email: 'legacy@example.test', name: 'Lee Gacy' })
    const { clientId, tokenName } = seedState()
    await page.goto(examplePath({ clientId, tokenName }))
    const dialog = await openWidget(page)
    await dialog.getByRole('button', { name: 'Google Calendar' }).click()
    // 1.x asked for the person's name and email when the page gave none; 2.0 still does.
    await expect(dialog.getByRole('heading', { name: 'Your details' })).toBeVisible()
    await dialog.getByLabel('Name').fill('Lee Gacy')
    await dialog.getByLabel('Email').fill('legacy@example.test')
    const popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Continue', exact: true }).click()
    await (await popup).getByRole('button', { name: 'Allow' }).click()
    await expect(dialog.getByRole('heading', { name: 'Account connected' })).toBeVisible()
    await expect(events(page, 'accountConnected')).toContainText('legacy@example.test')
    await expect(events(page, 'connected')).toContainText('legacy@example.test')
})
