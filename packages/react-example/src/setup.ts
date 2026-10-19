/**
 * What the example gives the widget, from the page's address:
 *
 *   ?token=pcs_...            a connect session's token (your server makes it)
 *   ?fresh=1                  instead, a new session per attempt, from POST /api/pyas-session
 *   ?api=http://localhost:3998  the Pyas API
 *   ?theme=dark|auto  ?display=inline  ?mode=redirect  ?providers=google,zoom  ?hideTrigger=1
 *   ?clientId=...&tokenName=...   PyasConnect 1.x's keys instead of a session
 *
 * The same file is in every example (React, Vue, Angular).
 */

export interface Setup {
  props: Record<string, unknown>
  hideTrigger: boolean
}

export const freshSession = async (): Promise<string> => {
  const res = await fetch('/api/pyas-session', { method: 'POST' })
  if (!res.ok) throw new Error('Could not make a connect session.')
  return (await res.json()).token
}

export const readSetup = (search: string = window.location.search): Setup => {
  const q = new URLSearchParams(search)
  const props: Record<string, unknown> = {}
  const copy = (name: string, prop = name) => {
    const value = q.get(name)
    if (value !== null && value !== '') props[prop] = value
  }
  copy('token', 'sessionToken')
  copy('api', 'apiUrl')
  copy('theme')
  copy('display')
  copy('mode')
  copy('providers')
  copy('clientId')
  copy('tokenName')
  copy('callbackOrigins')
  if (q.get('fresh') === '1') props['getSessionToken'] = freshSession
  const hideTrigger = q.get('hideTrigger') === '1'
  if (hideTrigger) props['hideTrigger'] = true
  // The page follows the widget's theme, so a dark widget is seen on a dark page.
  const theme = q.get('theme')
  const dark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset['theme'] = dark ? 'dark' : 'light'
  return { props, hideTrigger }
}
