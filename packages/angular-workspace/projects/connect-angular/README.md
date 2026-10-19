# @pyas/connect-angular

PyasConnect for Angular 19 and later: the dialog your users connect their
Google, Microsoft or Zoom calendar in, for apps built on
[Pyas](https://pyas.io).

```bash
npm install @pyas/connect-angular
```

Your server makes a connect session (`POST /v2/connect/sessions` with your API
key) and gives the page its token:

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

Outputs carry the event's data. `PyasConnectModule` is still exported for
NgModule apps. The element is loaded in the browser only, so server rendering
works as it is.

Every input, output and styling hook:
[the full guide](https://github.com/brutforce-tech/pyas-connect#readme).

MIT
