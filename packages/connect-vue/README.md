# Vue 3 — `@pyas/connect-vue`

> A Vue 3 plugin wrapper around the Pyas Connect Web Component, exposing PyasConnect as a first-class Vue component

## Usage

```bash
npm install @pyas/connect-vue # core auto‑installed
```
Use the wrapper directly inside any component file. No need to modify main.ts or register a global plugin.

```vue
<script setup>
import { PyasConnect } from '@pyas/connect-vue';

function onSuccess(event) {
  console.log('linked', event.detail);
}
</script>

<template>
  <PyasConnectVue
    client-id="YOUR_CLIENT_ID"
    token-name="YOUR_TOKEN_NAME"
    @account-connected="onSuccess"
  />
</template>
```
