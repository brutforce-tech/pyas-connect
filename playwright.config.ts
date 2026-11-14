import { defineConfig, devices } from '@playwright/test'
import { API_URL, EXAMPLES, PLAYGROUND, STATE_FILE } from './e2e/support/env'

/**
 * PyasConnect end to end: the widget in a React, a Vue and an Angular app,
 * against a real Pyas API whose test server plays Google, Microsoft and Zoom.
 * The sign-in window's consent page is played by the tests
 * (e2e/support/provider.ts), so nothing reaches a provider.
 *
 *   npm run build            once (the examples use the built packages)
 *   npm run e2e              every journey in every framework
 *
 * Needs PYAS_E2E_API_URL and PYAS_E2E_STATE (e2e/support/env.ts). Uses the installed Chrome.
 */

export default defineConfig({
    testDir: './e2e',
    outputDir: './e2e/.results',
    snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
    fullyParallel: false,
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/.report' }]],
    globalSetup: './e2e/support/globalSetup.ts',
    use: {
        channel: 'chrome',
        viewport: { width: 1280, height: 800 },
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    // Tight: a border's color or a panel's shadow is a few hundred pixels, and must count.
    expect: { toHaveScreenshot: { maxDiffPixels: 100, animations: 'disabled' } },
    projects: EXAMPLES.map((e) => ({
        name: e.name,
        use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1280, height: 800 }, baseURL: e.url },
    })),
    webServer: [
        ...EXAMPLES.map((e) => ({
            command: e.command,
            cwd: e.cwd,
            url: e.url,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
        })),
        {
            command: PLAYGROUND.command,
            cwd: PLAYGROUND.cwd,
            url: PLAYGROUND.url,
            reuseExistingServer: !process.env.CI,
            env: { PYAS_API_URL: API_URL, PYAS_API_KEY_FILE: STATE_FILE },
        },
    ],
})
