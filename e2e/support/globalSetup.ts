import { execSync } from 'node:child_process'
import { API_DIR, EXAMPLES, PLAYGROUND, STATE_FILE } from './env'

/**
 * Fresh data before every run: pyas-api's widget seed (its own database,
 * `pyas_e2e_connect`), with the example apps' and the playground's origins allowed. The live key it
 * makes is written to e2e/.state.json (gitignored, local data only).
 */
export default function globalSetup() {
    execSync('npx tsx e2e/connectSeed.ts', {
        cwd: API_DIR,
        stdio: 'inherit',
        env: {
            ...process.env,
            E2E_DB: 'pyas_e2e_connect',
            E2E_CONNECT_ORIGINS: [...EXAMPLES, PLAYGROUND].map((e) => e.url).join(','),
            E2E_CONNECT_OUT: STATE_FILE,
        },
    })
}
