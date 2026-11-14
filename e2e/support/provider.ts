import type { BrowserContext } from '@playwright/test'

/**
 * Google's, Microsoft's and Zoom's consent pages, played in the sign-in
 * window. The page has Allow and Cancel, and sends the person back to the
 * redirect URI the way the provider would: with a code on Allow (the code
 * says who signed in, as the API's test server reads it) or
 * `error=access_denied` on Cancel.
 */

const CONSENT = /^https:\/\/(accounts\.google\.com\/o\/oauth2|login\.microsoftonline\.com\/common\/oauth2\/v2\.0\/authorize|zoom\.us\/oauth\/authorize)/

const NAMES: Array<[RegExp, string]> = [[/google/, 'Google'], [/microsoftonline/, 'Microsoft'], [/zoom/, 'Zoom']]

const page = (provider: string, code: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Sign in with ${provider}</title>
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}main{text-align:center}button{font:inherit;margin:4px;padding:8px 16px}</style>
</head><body><main>
<h1>Sign in with ${provider}</h1>
<p>Played by the end-to-end tests.</p>
<button id="allow">Allow</button><button id="deny">Cancel</button>
</main><script>
const here = new URL(location.href)
const back = new URL(here.searchParams.get('redirect_uri'))
back.searchParams.set('state', here.searchParams.get('state') || '')
document.getElementById('allow').onclick = () => { back.searchParams.set('code', ${JSON.stringify(code)}); location.href = back.href }
document.getElementById('deny').onclick = () => { back.searchParams.set('error', 'access_denied'); location.href = back.href }
</script></body></html>`

export interface PlayedProvider {
    /** Who signs in on Allow: an email and name, or a code that fails ('e2e-expired', 'e2e-offline'). */
    signInAs(who: { email: string; name: string } | string): void
}

export const playProviders = async (context: BrowserContext): Promise<PlayedProvider> => {
    let code = 'e2e~ana@example.test~Ana Silva'
    await context.route(CONSENT, (route) => {
        const url = route.request().url()
        const provider = NAMES.find(([re]) => re.test(url))?.[1] ?? 'the provider'
        return route.fulfill({ status: 200, contentType: 'text/html', body: page(provider, code) })
    })
    return {
        signInAs(who) {
            code = typeof who === 'string' ? who : `e2e~${who.email}~${who.name}`
        },
    }
}
