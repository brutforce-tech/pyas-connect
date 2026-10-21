# @pyas/connect

`<pyas-connect>` is the dialog where your users connect their Google, Microsoft
or Zoom calendar to apps built on [Pyas](https://pyas.io). It's a standard web
component, so it works in any page and any framework.

```bash
npm install @pyas/connect
```

Your server creates a connect session (`POST /v2/connect/sessions` with your
API key) and passes its token to the page:

```js
import '@pyas/connect/dist/components/pyas-connect.js'
```

```html
<pyas-connect session-token="pcs_..." theme="auto"></pyas-connect>
<script>
  document.querySelector('pyas-connect').addEventListener('connected', (e) => save(e.detail.accountId))
</script>
```

You can also load it from a CDN, with no build step:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@pyas/connect@2/dist/pyas-connect/pyas-connect.esm.js"></script>
```

Wrappers are available for React, Vue and Angular:
[`@pyas/connect-react`](https://www.npmjs.com/package/@pyas/connect-react),
[`@pyas/connect-vue`](https://www.npmjs.com/package/@pyas/connect-vue) and
[`@pyas/connect-angular`](https://www.npmjs.com/package/@pyas/connect-angular).

For properties, events, styling, translations and upgrading from 1.x, see
[the full guide](https://github.com/brutforce-tech/pyas-connect#readme).

MIT
