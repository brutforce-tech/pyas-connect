# @pyas/connect-vue

PyasConnect for Vue 3. PyasConnect is the dialog where your users connect their
Google, Microsoft or Zoom calendar to apps built on [Pyas](https://pyas.io).

```bash
npm install @pyas/connect-vue
```

Your server creates a connect session (`POST /v2/connect/sessions` with your
API key) and passes its token to the page:

```vue
<script setup>
import { PyasConnect } from '@pyas/connect-vue'
defineProps(['token'])
</script>

<template>
  <PyasConnect :session-token="token" theme="auto" @connected="(account) => save(account.accountId)" />
</template>
```

Events include the event's data. To open the dialog from your own button, set
`hide-trigger`, add a template ref, and call its `open()` method from a click.
The element loads only in the browser, so Nuxt and server rendering work
without changes.

For every prop, event and styling hook, see
[the full guide](https://github.com/brutforce-tech/pyas-connect#readme).

MIT
