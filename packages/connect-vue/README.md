# @pyas/connect-vue

PyasConnect for Vue 3: the dialog your users connect their Google, Microsoft or
Zoom calendar in, for apps built on [Pyas](https://pyas.io).

```bash
npm install @pyas/connect-vue
```

Your server makes a connect session (`POST /v2/connect/sessions` with your API
key) and gives the page its token:

```vue
<script setup>
import { PyasConnect } from '@pyas/connect-vue'
defineProps(['token'])
</script>

<template>
  <PyasConnect :session-token="token" theme="auto" @connected="(account) => save(account.accountId)" />
</template>
```

Events carry the event's data. To open it from your own button, set
`hide-trigger`, take a template ref and call its `open()` from a click. The
element is loaded in the browser only, so Nuxt and server rendering work as
they are.

Every prop, event and styling hook:
[the full guide](https://github.com/brutforce-tech/pyas-connect#readme).

MIT
