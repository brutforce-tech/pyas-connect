# Angular — `@pyas/connect-angular`

> An Angular plugin wrapper around the Pyas Connect Web Component <https://www.npmjs.com/package/@pyas/connect>, exposing PyasConnect as a first-class Angular component

## Usage

```bash
npm install @pyas/connect-angular # core (@pyas/connect) auto-installed
```
Register the custom pyas-connect element
```ts
  // main.ts
  import { pyasConnectLoader } from '@pyas/connect-angular';
  pyasConnectLoader()
```
Import the Component
```ts
// app.module.ts
...
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PyasConnect } from '@pyas/connect-angular';

@NgModule({
  imports: [
    BrowserModule, 
    PyasConnect
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```
```html
<pyas-connect
  user-name="Jane Doe"
  user-email="jane@gmail.com"
  client-id="some-client-id"
  token-name="token-name"
  (accountConnected)="onSuccess($event)"
></pyas-connect>
```

## Full Documentation
Full usage documentation can be found on the core component on npm: <https://www.npmjs.com/package/@pyas/connect>
And also on GitHub: <https://github.com/brutforce-tech/pyas-connect>
