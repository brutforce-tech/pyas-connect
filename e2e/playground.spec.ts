import { expect, test } from '@playwright/test'
import { PLAYGROUND, seedState } from './support/env'
import { playProviders } from './support/provider'

/**
 * The plain playground (`npm run playground`): the element alone, its server
 * making a session per attempt with the key the page never sees.
 */

test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'react', 'One page, not per framework.')
})

test('the playground connects a calendar with a session its server makes', async ({ page, context }) => {
    const provider = await playProviders(context)
    provider.signInAs({ email: 'play@example.test', name: 'Play Ground' })
    let sessions = 0
    page.on('request', (r) => { if (r.url().endsWith('/api/pyas-session')) sessions++ })
    await page.goto(PLAYGROUND.url)
    await expect(page.getByText('API http://localhost:3998')).toBeVisible()

    await page.getByRole('button', { name: 'Connect an account' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText(seedState().appName)
    const popup = page.waitForEvent('popup')
    await dialog.getByRole('button', { name: 'Continue with Google' }).click()
    await (await popup).getByRole('button', { name: 'Allow' }).click()
    await expect(dialog.getByRole('heading', { name: 'Account connected' })).toBeVisible()
    await expect(page.locator('#events')).toContainText('play@example.test')
    expect(sessions).toBeGreaterThanOrEqual(1)

    // Settings rebuild the widget, as a page re-rendering it would.
    await dialog.getByRole('button', { name: 'Done' }).click()
    await page.getByText('Inline', { exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Connect an account' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Connect an account' })).toHaveCount(0)
})
