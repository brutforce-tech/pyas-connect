# PyasConnect

The dialog your users connect their Google, Microsoft or Zoom calendar in, for
apps built on [Pyas](https://pyas.io). One web component, `<pyas-connect>`,
with thin wrappers for React, Vue and Angular.

- **Secure by default.** Your server makes a short-lived connect session; the
  browser never holds your API key.
- **Looks like your product.** Your app's name and icon (from the Pyas
  dashboard) come first; it inherits your page's font, follows your theme, and
  shows a small "Secured by Pyas" line.
- **Nobody gets stuck.** Every wait says what is happening, every failure
  offers a way forward, and pop-up blockers and phones are handled.
- **Accessible.** A real dialog: focus stays inside it, Escape closes it and
  returns focus, a screen reader hears each step, and reduced motion is
  respected. Every state is checked with axe against WCAG 2.2 AA.

| Package | For |
|---|---|
| `@pyas/connect` | The `<pyas-connect>` element: any page, any framework |
| `@pyas/connect-react` | React 18 and 19 |
| `@pyas/connect-vue` | Vue 3 |
| `@pyas/connect-angular` | Angular 19 and later |
| `@pyas/connect-core` | The flow without a UI, to build your own |

## Connect a calendar in two steps

**1. On your server**, create a connect session with your live API key. It is
single use and lasts 10 minutes, so make one each time the dialog opens.

```js
const res = await fetch('https://api.pyas.io/v2/connect/sessions', {
  method: 'POST',
  headers: { 'x-api-key': process.env.PYAS_API_KEY, 'content-type': 'application/json' },
  body: JSON.stringify({ subjectId: user.id, providers: ['google', 'microsoft'] }),
})
const { data } = await res.json()
// send data.token to the page
```

**2. In your page**, give the element the session's token.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@pyas/connect@2/dist/pyas-connect/pyas-connect.esm.js"></script>

<pyas-connect session-token="pcs_..." theme="auto"></pyas-connect>
<script>
  document.querySelector('pyas-connect').addEventListener('connected', (e) => {
    console.log('Connected', e.detail.accountId, e.detail.email)
  })
</script>
```

The element shows its own "Connect a calendar" button; put your own text inside
it, or set `hide-trigger` and call `open()` from your button.

### React

```jsx
import { PyasConnect } from '@pyas/connect-react'

<PyasConnect sessionToken={token} onConnected={(account) => save(account.accountId)} onError={(e) => report(e.code)} />
```

### Vue

```vue
<script setup>
import { PyasConnect } from '@pyas/connect-vue'
</script>

<template>
  <PyasConnect :session-token="token" @connected="(account) => save(account.accountId)" />
</template>
```

### Angular

```ts
import { PyasConnect } from '@pyas/connect-angular'

@Component({
  imports: [PyasConnect],
  template: `<pyas-connect [sessionToken]="token" (connected)="save($event.accountId)"></pyas-connect>`,
})
```

### A fresh session for every attempt

Instead of a token, give the element a function that fetches one. Then every
failure can be tried again right in the dialog, without reloading.

```js
element.getSessionToken = async () => (await fetch('/api/pyas-session', { method: 'POST' }).then((r) => r.json())).token
```

## Properties

| Property (attribute) | What it does |
|---|---|
| `session-token` | The connect session's token from your server |
| `getSessionToken` (property only) | A function returning a new token per attempt |
| `providers` | Which to offer: `google,microsoft,zoom` (the session's list still applies) |
| `display` | `dialog` (default) or `inline`, in the page |
| `theme` | `light` (default), `dark` or `auto` |
| `mode` | `popup` (default) or `redirect` for in-app browsers; the session needs a `returnUrl` |
| `hide-trigger` | No built-in button: call `open()` yourself |
| `strings` | Replace any of the dialog's words (also how you translate it); an object, or JSON in the attribute |
| `api-url` | Another Pyas API (a local one, for development) |
| `callback-origins` | Your own OAuth callback page's origin, if your app signs in with its own OAuth app |

Methods: `open()` (call it from a click: sign-in windows may only open from
one) and `close()`.

## Events

| Event | `detail` | When |
|---|---|---|
| `connected` | `accountId`, `provider`, `email`, `name`, `subjectId` | A calendar was connected |
| `error` | `code`, `message`, `retryable` | The flow ended without connecting |
| `cancel` | none | The person closed it without connecting |

An `error` a person can recover from in the dialog (they refused at Google, a
pop-up was blocked) is sent only if they give up and close it. One they cannot
(an expired session) is sent at once, so your page can make a new session.
Codes are the [error registry's](https://developer.pyas.io/errors): the
widget's own start with `CONNECT_` (`CONNECT_TIMEOUT`,
`CONNECT_CONSENT_DENIED`, `CONNECT_POPUP_BLOCKED`, ...), the API's keep theirs.

## Styling

The dialog lives in a shadow root, so your page's CSS cannot break it. Theme
it with CSS variables on the element, or reach its parts with `::part()`.

```css
pyas-connect {
  --pyas-connect-accent: #0f766e;
  --pyas-connect-radius: 10px;
  --pyas-connect-font: 'Inter', sans-serif;
}
pyas-connect::part(primary-button) { text-transform: none; }
```

Variables: `--pyas-connect-surface`, `-subtle`, `-text`, `-muted`, `-border`,
`-border-strong`, `-accent`, `-accent-hover`, `-accent-text`, `-danger`,
`-warning`, `-warning-subtle`, `-success`, `-success-subtle`, `-focus`, `-overlay`, `-radius`, `-font`. Parts:
`trigger`, `dialog`, `header`, `title`, `provider-button`, `primary-button`,
`secondary-button`, `footer`. Google's and Microsoft's buttons keep their own
colors, as their branding guidelines require.

## Your own OAuth app

If your app signs people in with its own Google, Microsoft or Zoom app, the
provider sends people back to your own callback page. Hand the result to the
widget from there:

```js
import { postCallbackResult } from '@pyas/connect'
postCallbackResult()
```

The callback page must be on the same site as the widget.

## Upgrading from 1.x

Nothing breaks. 2.0 still accepts `client-id` and `token-name` and still sends
`accountConnected` and `connectError`, so an existing integration works as it
is. Moving to sessions is two changes: add the server step above, then swap the
two properties for `session-token`.

## Developing

```bash
npm install
npm run build   # every package, in order
npm test        # core, element and wrapper tests
npm run size    # the bundle budget: 25 KB gzipped for the element with the core
npm run e2e     # the widget in React, Vue and Angular apps against a local API
npm run playground  # the element alone on a plain page, against your local API
```

The playground (http://localhost:4100) makes a connect session for every
attempt with a live key of yours: copy `playground/.env.example` to
`playground/.env`, set `PYAS_API_KEY` (and `PYAS_API_URL` if your API is not on
`http://localhost:3030`), and add `http://localhost:4100` to the app's allowed
origins in the dashboard. Rebuild the element (`npm run build -w @pyas/connect`,
or `npx stencil build --watch` in `packages/connect`) and reload to see a
change.

The end-to-end suite needs [pyas-api](https://github.com/brutforce-tech/pyas-api)
next to this repo (or `PYAS_API_DIR`) with its test databases up
(`npm run test:db:up` there). It starts the API in its own database, plays
Google's, Microsoft's and Zoom's sign-in pages, and runs every journey in each
example app, then screenshots and axe-checks every state of the dialog.

Releases are published from a version tag only:

```bash
npm run version:set -- 2.0.0
git commit -am "2.0.0" && git tag v2.0.0 && git push --follow-tags
```

A pre-release (`2.0.0-rc.1`) is published to npm's `next` tag, so `latest`
stays on the last release.

## License

MIT
