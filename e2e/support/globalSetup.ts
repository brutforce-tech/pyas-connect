import fs from 'node:fs'
import { API_URL, STATE_FILE, type SeedState } from './env'

/**
 * Before any journey: the settings are there and the API answers, so a missing setting fails
 * once with what to set, not in every test.
 */
export default async function globalSetup() {
    if (!API_URL || !STATE_FILE) {
        throw new Error('Set PYAS_E2E_API_URL to the Pyas API the suite runs against, and PYAS_E2E_STATE to the JSON file with its test app (see e2e/support/env.ts).')
    }
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as Partial<SeedState>
    const missing = (['apiKey', 'appId', 'appName', 'clientId', 'tokenName'] as const).filter((field) => !state[field])
    if (missing.length) throw new Error(`${STATE_FILE} has no ${missing.join(', ')}.`)
    const answered = await fetch(`${API_URL}/v2/openapi.json`).then((res) => res.ok, () => false)
    if (!answered) throw new Error(`No Pyas API answers at ${API_URL} (PYAS_E2E_API_URL).`)
}
