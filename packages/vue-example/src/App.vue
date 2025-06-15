<script setup>
import { PyasConnect } from '@pyas/connect-vue'

const handleConnected = (event) => {
  console.log('Account connected:', event)
}

const handleConnectError = (error) => {
  console.error('Connect error:', error)
}

const email = 'jon@gmail.com'
const name = 'Jon Doe'
</script>

<template>
  <main>
   <PyasConnect
    client-id="YOUR_CLIENT_ID"
    token-name="YOUR_TOKEN_NAME"
    :user-email="email"
    :user-name="name"
    theme="dark"
    :show-disclaimer="true"
    @account-connected="handleConnected"
    @connect-error="handleConnectError"
  >
    <span>Connect an Account</span>
  </PyasConnect>
  </main>
</template>

<style scoped>
</style>
