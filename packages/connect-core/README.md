# @pyas/connect-core

The PyasConnect flow without a UI, as a small state machine. It handles connect
sessions, the sign-in window, the provider's response and every failure. Use it
to build your own connect screen. For the ready-made dialog, use
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

// Call choose() from a click, because browsers allow sign-in windows to open only from a click:
googleButton.onclick = () => flow.choose('google')
```

`status` moves through `loading`, `choosing`, `authorizing`, `waiting` and
`completing`, and ends at `connected`, `failed` or `cancelled`. From each
status, you can continue with `retry()`, `back()`, `reopen()` or `cancel()`.
`destroy()` cleans up the flow.

MIT
