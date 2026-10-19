# @pyas/connect-core

The PyasConnect flow without a UI: connect sessions, the sign-in window, the
provider's answer and every failure, as a small state machine. Use it to build
your own connect screen; for the ready-made dialog, use
[`@pyas/connect`](https://www.npmjs.com/package/@pyas/connect).

```bash
npm install @pyas/connect-core
```

```js
import { createConnectFlow } from '@pyas/connect-core'

const flow = createConnectFlow({
  session: () => fetch('/api/pyas-session', { method: 'POST' }).then((r) => r.json()).then((b) => b.token),
  onConnected: (account) => save(account.accountId),
  onError: (error) => report(error.code),
})

flow.subscribe((state) => render(state)) // status, providers, app, error, ...
await flow.start()

// From a click (sign-in windows may only open from one):
googleButton.onclick = () => flow.choose('google')
```

`status` moves through `loading`, `choosing`, `authorizing`, `waiting`,
`completing`, then `connected`, `failed` or `cancelled`. `retry()`, `back()`,
`reopen()` and `cancel()` are the ways forward from each; `destroy()` cleans
up.

MIT
