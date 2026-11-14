# @pyas/connect-react

PyasConnect for React 18 and 19. PyasConnect is the dialog where your users
connect their Google, Microsoft or Zoom calendar to apps built on
[Pyas](https://pyas.io).

```bash
npm install @pyas/connect-react
```

Your server creates a connect session (`POST /v2/connect/sessions` with your
API key) and passes its token to the page:

```jsx
import { PyasConnect } from '@pyas/connect-react'

export function ConnectCalendar({ token }) {
  return (
    <PyasConnect
      sessionToken={token}
      theme="auto"
      onConnected={(account) => save(account.accountId)}
      onError={(error) => report(error.code)}
    />
  )
}
```

Callbacks receive the event's data. To open the dialog from your own button,
pass a `ref`, set `hideTrigger`, and call `ref.current.open()` from a click.
The element loads only in the browser, so server rendering works without
changes.

For every prop, event and styling hook, see
[the full guide](https://github.com/brutforce-tech/pyas-connect#readme).

MIT
