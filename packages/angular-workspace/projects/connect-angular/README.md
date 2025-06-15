# Angular — `@pyas/connect-angular`

> An Angular plugin wrapper around the Pyas Connect Web Component <https://www.npmjs.com/package/@pyas/connect>, exposing PyasConnect as a first-class Angular component

## Usage

```bash
npm install @pyas/connect-angular # core (@pyas/connect) auto-installed
```
Import the Component
```ts
// app.component.ts
...
import { Component } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { PyasConnect } from '@pyas/connect-angular'; // <-- PyasConnect angular component

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PyasConnect],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'angular-example';
    //handle accountConnected event
    onAccountConnected(acc: any) { console.log('Connected:', acc) }
    //handle connectError event
    onConnectError(err: any)    { console.error('Error:', err) }
}

```
Use in your HTMl template
```html
<pyas-connect
    clientId="pyas_cff12c34-41c4-4d4b-840f-fd1c3562b32f"
    tokenName="NEW KEY"
    userName="Jon Snow"
    userEmail="jon.snow@winterfell.com"
    theme="light"
    productName="Skyline AI"
    (accountConnected)="onAccountConnected($event)"
    (connectError)="onConnectError($event)"
  ></pyas-connect>
```

## Full Documentation
Full usage documentation can be found on the core component on npm: <https://www.npmjs.com/package/@pyas/connect>
And also on GitHub: <https://github.com/brutforce-tech/pyas-connect>
