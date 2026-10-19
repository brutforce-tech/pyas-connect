/**
 * Every word the widget shows, from the PyasConnect 2.0 design. Any of them
 * can be replaced through the `strings` property, which is also how a
 * translation is supplied. `{app}`, `{provider}`, `{calendar}` and `{email}`
 * are filled in.
 *
 * The person connecting never reads about billing, tokens or Pyas internals:
 * failures say what happened in their words, and the developer gets the code.
 */
export const DEFAULT_STRINGS = {
    trigger: 'Connect a calendar',
    close: 'Close',
    loading: 'Loading',

    chooseTitle: 'Connect your calendar',
    chooseIntro: '{app} sees only what you allow on the next screen.',
    continueWith: 'Continue with {provider}',
    connectZoom: 'Connect Zoom',

    reconnectTitle: 'Reconnect your calendar',
    reconnectIntro: 'Your {provider} connection for {email} stopped working. Reconnect to keep events in sync.',
    reconnectIntroNoEmail: 'Your {provider} connection stopped working. Reconnect to keep events in sync.',
    reconnectButton: 'Reconnect {provider}',

    detailsTitle: 'Your details',
    detailsName: 'Name',
    detailsEmail: 'Email',
    detailsContinue: 'Continue',
    detailsNameNeeded: 'Enter your name.',

    waitingTitle: 'Continue in {provider}',
    waitingBody: 'Allow access in the window that opened, then come back.',
    reopen: 'No window? Open it again',
    windowClosed: 'Did the window close?',
    openAgain: 'Open it again',
    stillThere: 'Still there? The window may be behind this one.',
    startOver: 'Start over',
    cancel: 'Cancel',
    chooseAnother: 'Choose another calendar',
    finishing: 'Finishing up',
    redirecting: 'Taking you to {provider}',

    connectedTitle: 'Calendar connected',
    done: 'Done',

    deniedTitle: "Access wasn't granted",
    deniedBody: "{provider} didn't share your calendar. Try again or pick another one.",
    tryAgain: 'Try again',
    blockedTitle: 'Your browser blocked the sign-in window',
    blockedBody: 'Open it with the button below. If it is blocked again, allow pop-ups for this site.',
    openWindow: 'Open window',
    scopeTitle: 'Calendar access is needed',
    scopeBody: 'Try again and leave calendar access ticked.',
    unavailableTitle: "{provider} isn't responding",
    unavailableBody: 'Try again in a few minutes.',
    networkTitle: "We couldn't reach the sign-in service",
    networkBody: 'Check your connection and try again.',
    expiredTitle: 'This sign-in link has expired',
    expiredBody: 'Close this and start again.',
    limitTitle: "{app} can't add more calendars right now",
    limitBody: 'Close this and try again later.',
    genericTitle: "We couldn't connect your calendar",
    genericBody: 'Try again in a moment.',
    configTitle: "This connect button isn't set up yet",
    configBody: 'Let the people who run this site know.',

    securedBy: 'Secured by Pyas',
    fallbackApp: 'This app',
}

export type PyasConnectStrings = typeof DEFAULT_STRINGS

const CALENDAR_NAMES: Record<string, string> = { google: 'Google Calendar', microsoft: 'Outlook Calendar', zoom: 'Zoom' }
const PROVIDER_NAMES: Record<string, string> = { google: 'Google', microsoft: 'Microsoft', zoom: 'Zoom' }

export const providerName = (provider: string | null | undefined) => (provider ? PROVIDER_NAMES[provider] ?? provider : '')
export const calendarName = (provider: string | null | undefined) => (provider ? CALENDAR_NAMES[provider] ?? provider : '')

/** A string with its `{name}` slots filled; unknown slots are left as they are. */
export const fill = (template: string, values: Record<string, string | null | undefined>) =>
    template.replace(/\{(\w+)\}/g, (whole, key) => (values[key] ?? whole) as string)
