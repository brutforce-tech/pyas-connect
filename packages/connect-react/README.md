# @pyas/connect-react

PyasConnect for React 18 and 19: the dialog your users connect their Google,
Microsoft or Zoom calendar in, for apps built on [Pyas](https://pyas.io).

```bash
npm install @pyas/connect-react
```

Your server makes a connect session (`POST /v2/connect/sessions` with your API
key) and gives the page its token:

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

Callbacks receive the event's data. To open it from your own button, pass a
`ref` and set `hideTrigger`: `ref.current.open()` (from a click). The element is
loaded in the browser only, so server rendering works as it is.

Every prop, event and styling hook:
[the full guide](https://github.com/brutforce-tech/pyas-connect#readme).

MIT
