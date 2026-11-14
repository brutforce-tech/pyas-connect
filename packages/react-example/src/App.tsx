import { useRef, useState } from 'react'
import { PyasConnect, type PyasConnectHandle } from '@pyas/connect-react'
import { readSetup } from './setup'

/**
 * PyasConnect in a React app's settings page. What it is given comes from the
 * page's address (see setup.ts), so the end-to-end suite can drive every case.
 */

type Logged = { event: string; detail: unknown }

const setup = readSetup()

export default function App() {
  const widget = useRef<PyasConnectHandle>(null)
  const [log, setLog] = useState<Logged[]>([])
  const [accounts, setAccounts] = useState<Array<{ accountId: string; email: string; provider: string }>>([])
  const record = (event: string) => (detail?: unknown) => setLog((all) => [...all, { event, detail: detail ?? null }])

  const onConnected = (account: { accountId: string; email: string; provider: string }) => {
    record('connected')(account)
    setAccounts((all) => [...all, account])
  }

  const openWidget = () => {
    void widget.current?.open()
  }

  return (
    <main className="example-page">
      <header>
        <p className="crumb">Acme · Settings</p>
        <h1>Calendars</h1>
      </header>
      <section className="example-card">
        <h2>Your calendars</h2>
        <p>Connect the calendar you work from, so bookings land on it and your busy times are respected.</p>
        {setup.hideTrigger && <button className="example-own-button" onClick={openWidget}>Add a calendar</button>}
        <PyasConnect
          ref={widget}
          {...setup.props}
          onConnected={onConnected}
          onError={record('error')}
          onCancel={record('cancel')}
          onAccountConnected={record('accountConnected')}
          onConnectError={record('connectError')}
        />
        {accounts.length > 0 && (
          <ul className="example-connected" aria-label="Connected calendars">
            {accounts.map((a) => <li key={a.accountId}><span>{a.email}</span><span>{a.provider}</span></li>)}
          </ul>
        )}
      </section>
      <details className="example-log" open={log.length > 0}>
        <summary>Events</summary>
        <ol data-testid="events">
          {log.map((l, i) => <li key={i} data-event={l.event}>{l.event} {JSON.stringify(l.detail)}</li>)}
        </ol>
      </details>
    </main>
  )
}
