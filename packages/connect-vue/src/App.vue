<script setup lang="ts">
import PyasConnect from '@/components/PyasConnect.vue';
</script>

<template>
  <main>
    <PyasConnect
        client-id="your-client-id"
        token-name="your-token-name"
        product-name="Skyline AI"
        user-name="Jimmy"
        user-email="jimmy.test@example.com"
        theme="dark"
    ></PyasConnect>
  </main>
</template>

<style scoped>
</style>
