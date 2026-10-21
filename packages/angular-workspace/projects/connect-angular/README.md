# @pyas/connect-angular

PyasConnect for Angular 19 and later. PyasConnect is the dialog where your
users connect their Google, Microsoft or Zoom calendar to apps built on
[Pyas](https://pyas.io).

```bash
npm install @pyas/connect-angular
```

Your server creates a connect session (`POST /v2/connect/sessions` with your
API key) and passes its token to the page:

```ts
import { Component, input } from '@angular/core'
import { PyasConnect } from '@pyas/connect-angular'

@Component({
  selector: 'app-connect-calendar',
  imports: [PyasConnect],
  template: `<pyas-connect [sessionToken]="token()" theme="auto" (connected)="save($event.accountId)"></pyas-connect>`,
})
export class ConnectCalendar {
  token = input.required<string>()
  save(accountId: string) { /* ... */ }
}
```

Outputs emit the event's data. `PyasConnectModule` is still exported for
NgModule apps. The element loads only in the browser, so server rendering works
without changes.

For every input, output and styling hook, see
[the full guide](https://github.com/brutforce-tech/pyas-connect#readme).

MIT
