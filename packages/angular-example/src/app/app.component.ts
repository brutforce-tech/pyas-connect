import { Component, ViewChild } from '@angular/core'
import { PyasConnect } from '@pyas/connect-angular'
import { readSetup } from '../setup'

/*
 * PyasConnect in an Angular app's settings page. What it is given comes from
 * the page's address (see setup.ts), so the end-to-end suite can drive every case.
 */

type Account = { accountId: string; email: string; provider: string }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PyasConnect],
  templateUrl: './app.component.html',
})
export class AppComponent {
  @ViewChild(PyasConnect) widget?: PyasConnect

  readonly setup = readSetup()
  readonly p = this.setup.props as Record<string, any>
  log: Array<{ event: string; detail: unknown }> = []
  accounts: Account[] = []

  record(event: string, detail?: unknown) {
    this.log = [...this.log, { event, detail: detail ?? null }]
  }

  onConnected(account: Account) {
    this.record('connected', account)
    this.accounts = [...this.accounts, account]
  }

  openWidget() {
    void this.widget?.open()
  }

  json(value: unknown) {
    return JSON.stringify(value)
  }
}
