# @pyas/connect

`<pyas-connect>`: the dialog your users connect their Google, Microsoft or Zoom
calendar in, for apps built on [Pyas](https://pyas.io). A standard web
component, so it works in any page and any framework.

```bash
npm install @pyas/connect
```

Your server makes a connect session (`POST /v2/connect/sessions` with your API
key) and gives the page its token:

```js
import '@pyas/connect/dist/components/pyas-connect.js'
```

```html
<pyas-connect session-token="pcs_..." theme="auto"></pyas-connect>
<script>
  document.querySelector('pyas-connect').addEventListener('connected', (e) => save(e.detail.accountId))
</script>
```

Or from a CDN, with no build step:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@pyas/connect@2/dist/pyas-connect/pyas-connect.esm.js"></script>
```

Wrappers: [`@pyas/connect-react`](https://www.npmjs.com/package/@pyas/connect-react),
[`@pyas/connect-vue`](https://www.npmjs.com/package/@pyas/connect-vue),
[`@pyas/connect-angular`](https://www.npmjs.com/package/@pyas/connect-angular).

Properties, events, styling, translations and upgrading from 1.x:
[the full guide](https://github.com/brutforce-tech/pyas-connect#readme).

MIT
