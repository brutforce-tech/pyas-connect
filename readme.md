# PyasConnect

PyasConnect is the dialog where your users connect their Google, Microsoft or
Zoom calendar to apps built on [Pyas](https://pyas.io). It's one web component,
`<pyas-connect>`, with thin wrappers for React, Vue and Angular.

- **Secure by default.** Your server creates a short-lived connect session, so
  the browser never has access to your API key.
- **Looks like your product.** Your app's name and icon (from the Pyas
  dashboard) appear first. The dialog inherits your page's font, follows your
  theme, and shows a small "Powered by Pyas" line.
- **Clear at every step.** Every loading state explains what is happening, and
  every failure offers a way forward. The dialog also handles pop-up blockers
  and phones.
- **Accessible.** It's a real dialog. Focus stays inside it, Escape closes it
  and returns focus, screen readers announce each step, and it respects reduced
  motion. Every state is checked with axe against WCAG 2.2 AA.

| Package | For |
|---|---|
| `@pyas/connect` | The `<pyas-connect>` element, for any page and any framework |
| `@pyas/connect-react` | React 18 and 19 |
| `@pyas/connect-vue` | Vue 3 |
| `@pyas/connect-angular` | Angular 19 and later |
| `@pyas/connect-core` | The flow without a UI, for building your own |

PyasConnect is one of two ways to connect accounts. The other way is to build
your own screens with the SDK's `pyas.connect.oauth` and
`pyas.connect.accounts.create` methods.

## Connect a calendar in two steps

**1. On your server**, add one endpoint that creates a connect session with
your live API key. A session can be used once and expires after 10 minutes, so
create a new one each time the dialog opens. With the
[Pyas SDK](https://www.npmjs.com/package/@pyas/sdk), the endpoint is one line,
and it works without a login in your app:

```js
app.post('/api/pyas-session', pyas.connect.sessionHandler())
```

Without the SDK, create the session with a request to the API:

```js
const res = await fetch('https://api.pyas.io/v2/connect/sessions', {
  method: 'POST',
  headers: { 'x-api-key': process.env.PYAS_API_KEY, 'content-type': 'application/json' },
  body: JSON.stringify({ subjectId: user.id, providers: ['google', 'microsoft'] }),
})
const { data } = await res.json()
// send data.token to the page
```

**2. In your page**, pass the session's token to the element.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@pyas/connect@2/dist/pyas-connect/pyas-connect.esm.js"></script>

<pyas-connect session-token="pcs_..." theme="auto"></pyas-connect>
<script>
  document.querySelector('pyas-connect').addEventListener('connected', (e) => {
    console.log('Connected', e.detail.accountId, e.detail.email)
  })
</script>
```

The element shows its own "Connect an account" button. You can put your own
text inside the element, or set `hide-trigger` and call `open()` from your own
button.

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

Instead of a token, you can give the element a function that fetches one. The
dialog can then retry any failure without reloading the page.

```js
element.getSessionToken = async () => (await fetch('/api/pyas-session', { method: 'POST' }).then((r) => r.json())).token
```

## Properties

| Property (attribute) | Description |
|---|---|
| `session-token` | The connect session's token from your server |
| `getSessionToken` (property only) | A function that returns a new token for each attempt |
| `providers` | The providers to offer: `google,microsoft,zoom`. The session's list still applies. |
| `display` | `dialog` (default), or `inline` to show it in the page |
| `theme` | `light` (default), `dark` or `auto` |
| `mode` | `popup` (default), or `redirect` for in-app browsers. `redirect` requires a `returnUrl` on the session. |
| `hide-trigger` | Hides the built-in button, so you call `open()` yourself |
| `strings` | Replaces any of the dialog's text, which is also how you translate it. Accepts an object, or JSON in the attribute. |
| `api-url` | Another Pyas API, such as a local one for development |
| `callback-origins` | The origin of your own OAuth callback page, if your app uses Native Auth (your own OAuth app) |

The element has two methods, `open()` and `close()`. Call `open()` from a click
handler, because browsers allow sign-in windows to open only from a click.

## Events

| Event | `detail` | When |
|---|---|---|
| `connected` | `accountId`, `provider`, `email`, `name`, `subjectId` | A calendar was connected |
| `error` | `code`, `message`, `retryable` | The flow ended without connecting |
| `cancel` | none | The person closed the dialog without connecting |

Some errors can be recovered from in the dialog, for example when the person
declines access at Google or a pop-up is blocked. The element sends those
errors only if the person gives up and closes the dialog. Errors that can't be
recovered from, such as an expired session, are sent immediately, so your page
can create a new session.

Error codes come from the [error registry](https://developer.pyas.io/errors).
The widget's own codes start with `CONNECT_` (`CONNECT_TIMEOUT`,
`CONNECT_CONSENT_DENIED`, `CONNECT_POPUP_BLOCKED`, ...). The API's codes keep
their own names. `CONNECT_SESSION_FAILED` means your own session endpoint failed
or answered without a token; its `message` includes your endpoint's message.

## Styling

The dialog renders in a shadow root, so your page's CSS can't break it. To
theme it, set CSS variables on the element, or style its parts with
`::part()`.

```css
pyas-connect {
  --pyas-connect-accent: #0f766e;
  --pyas-connect-radius: 10px;
  --pyas-connect-font: 'Inter', sans-serif;
}
pyas-connect::part(primary-button) { text-transform: none; }
```

The available variables are `--pyas-connect-surface`, `-subtle`, `-text`,
`-muted`, `-border`, `-border-strong`, `-accent`, `-accent-hover`,
`-accent-text`, `-danger`, `-warning`, `-warning-subtle`, `-success`,
`-success-subtle`, `-focus`, `-overlay`, `-radius` and `-font`.

The available parts are `trigger`, `dialog`, `header`, `title`,
`provider-button`, `primary-button`, `secondary-button` and `footer`.

Google's and Microsoft's buttons keep their own colors, as their branding
guidelines require.

## Your own OAuth app

If your app uses Native Auth, it signs people in with your own Google,
Microsoft or Zoom OAuth app. The provider then redirects people to your own
callback page. From that page, pass the result to the widget:

```js
import { postCallbackResult } from '@pyas/connect'
postCallbackResult()
```

The callback page must be on the same site as the widget.

## Upgrading from 1.x

Version 2.0 is backward compatible. It still accepts `client-id` and
`token-name`, and it still sends `accountConnected` and `connectError`, so an
existing integration works without changes. To move to sessions, add the
server step above, then replace those two properties with `session-token`.

## Developing

```bash
npm install
npm run build   # every package, in order
npm test        # core, element and wrapper tests
npm run size    # the bundle budget: 25 KB gzipped for the element with the core
npm run e2e     # the widget in React, Vue and Angular apps against a local API
npm run playground  # the element alone on a plain page, against your local API
```

The playground (http://localhost:4100) creates a connect session for every
attempt with your own live key. To set it up:

1. Copy `playground/.env.example` to `playground/.env`.
2. Set `PYAS_API_KEY`, and `PYAS_API_URL` if your API isn't on
   `http://localhost:3030`.
3. Add `http://localhost:4100` to the app's allowed origins in the dashboard.

To see a change, rebuild the element and reload the page. Run
`npm run build -w @pyas/connect`, or `npx stencil build --watch` in
`packages/connect`.

The end-to-end suite runs against a Pyas API whose test server plays Google's,
Microsoft's and Zoom's sign-in, set with two settings: `PYAS_E2E_API_URL`, the
API, and `PYAS_E2E_STATE`, a JSON file with the test app's `apiKey` (a live
key), `appId`, `appName`, `clientId` and `tokenName`. The app's allowed
origins include the example apps and the playground (`http://localhost:4100`
to `4103`). The suite runs every user journey in each example app, then
captures a screenshot of every state of the dialog and checks each one with axe.

Releases are published only from a version tag:

```bash
npm run version:set -- 2.0.0
git commit -am "2.0.0" && git tag v2.0.0 && git push --follow-tags
```

A pre-release (`2.0.0-rc.1`) is published to npm's `next` tag, so `latest`
stays on the last release.

## License

MIT
