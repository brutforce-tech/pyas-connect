import fs from 'node:fs'
import path from 'node:path'
import type { APIRequestContext } from '@playwright/test'

const ROOT = path.resolve(__dirname, '..', '..')

/**
 * The Pyas API the suite runs against (its test server, which plays Google's, Microsoft's and
 * Zoom's sign-in), and a JSON file with the test app it was set up with (SeedState).
 */
export const API_URL = (process.env.PYAS_E2E_API_URL ?? '').replace(/\/+$/, '')
export const STATE_FILE = process.env.PYAS_E2E_STATE ?? ''

/** The three example apps, each a project: the same journeys run in every one. */
export const EXAMPLES = [
    { name: 'react', url: 'http://localhost:4101', cwd: path.join(ROOT, 'packages', 'react-example'), command: 'npx vite' },
    { name: 'vue', url: 'http://localhost:4102', cwd: path.join(ROOT, 'packages', 'vue-example'), command: 'npx vite' },
    { name: 'angular', url: 'http://localhost:4103', cwd: path.join(ROOT, 'packages', 'angular-example'), command: 'npx ng serve' },
]

/** The plain playground (playground/server.mjs), with the suite's key. */
export const PLAYGROUND = { name: 'playground', url: 'http://localhost:4100', cwd: ROOT, command: 'node playground/server.mjs' }

/**
 * The test app (PYAS_E2E_STATE): its live key, ID and name, the client ID PyasConnect 1.x uses,
 * and the name of the key. Its allowed origins include the example apps and the playground.
 */
export interface SeedState {
    apiKey: string
    appId: string
    appName: string
    clientId: string
    tokenName: string
}

export const seedState = (): SeedState => JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))

/** A connect session, as the developer's server makes it. */
export const makeSession = async (request: APIRequestContext, body: Record<string, unknown> = {}): Promise<string> => {
    const res = await request.post(`${API_URL}/v2/connect/sessions`, {
        headers: { 'x-api-key': seedState().apiKey },
        data: { providers: ['google', 'microsoft', 'zoom'], ...body },
    })
    if (!res.ok()) throw new Error(`Session not made: ${res.status()} ${await res.text()}`)
    return (await res.json()).data.token
}

/** The example page's address for a setup (see packages/react-example/src/setup.ts). */
export const examplePath = (setup: Record<string, string> = {}) => `/?${new URLSearchParams({ api: API_URL, ...setup })}`
