import fs from 'node:fs'
import path from 'node:path'
import type { APIRequestContext } from '@playwright/test'

const ROOT = path.resolve(__dirname, '..', '..')

export const API_DIR = process.env.PYAS_API_DIR || path.resolve(ROOT, '..', 'pyas-api')
export const API_URL = 'http://localhost:3998'
export const STATE_FILE = path.join(ROOT, 'e2e', '.state.json')

/** The three example apps, each a project: the same journeys run in every one. */
export const EXAMPLES = [
    { name: 'react', url: 'http://localhost:4101', cwd: path.join(ROOT, 'packages', 'react-example'), command: 'npx vite' },
    { name: 'vue', url: 'http://localhost:4102', cwd: path.join(ROOT, 'packages', 'vue-example'), command: 'npx vite' },
    { name: 'angular', url: 'http://localhost:4103', cwd: path.join(ROOT, 'packages', 'angular-example'), command: 'npx ng serve' },
]

/** The plain playground (playground/server.mjs), with the suite's key. */
export const PLAYGROUND = { name: 'playground', url: 'http://localhost:4100', cwd: ROOT, command: 'node playground/server.mjs' }

/** What the widget seed made (pyas-api/e2e/connectSeed.ts). */
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
