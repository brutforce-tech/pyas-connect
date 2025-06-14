<script setup>
import { PyasConnect } from '@pyas/connect-vue'

const handleConnected = (event) => {
  console.log('Account connected:', event)
}

const email = 'jon@gmail.com'
const name = 'Jon Snow'
</script>

<template>
  <main>
   <PyasConnect
    client-id="pyas_cff12c34-41c4-4d4b-840f-fd1c3562b32f"
    token-name="NEW KEY"
    :user-email="email"
    :user-name="name"
    :show-icloud="true"
    theme="dark"
    :show-disclaimer="true"
    @account-connected="handleConnected"
  >
    <span>Connect an Account</span>
  </PyasConnect>
  </main>
</template>

<style scoped>
</style>
