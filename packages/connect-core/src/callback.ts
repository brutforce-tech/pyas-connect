/**
 * For apps on their own OAuth app: the provider sends the person back to the
 * developer's own callback page, not Pyas's. Call this there, and it hands the
 * result to the widget that opened the window, then closes it:
 *
 *   import { postCallbackResult } from '@pyas/connect-core'
 *   postCallbackResult()
 *
 * It posts only to the page's own origin, so the widget must be on the same
 * site as the callback page (the widget trusts its own origin for this).
 */
export const postCallbackResult = (win: Window = window): boolean => {
    const params = new URLSearchParams(win.location.search)
    const code = params.get('code')
    const error = params.get('error')
    const rawState = params.get('state') ?? ''
    if (!win.opener || (!code && !error)) return false
    // The part after `_rest=` is what the widget's attempt is named by, as on Pyas's own callback page.
    const state = rawState.includes('_rest=') ? rawState.split('_rest=')[1] : rawState
    win.opener.postMessage({ type: 'pyas-oauth-complete', code, state, error }, win.location.origin)
    setTimeout(() => win.close(), 300)
    return true
}
