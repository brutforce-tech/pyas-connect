<script setup>
import { PyasConnect } from '@pyas/connect-vue'
</script>

<template>
  <main>
   <PyasConnect
      theme="dark"
      :show-icloud="true"
      user-name="Jane Doe"
      user-email="jane@gmail.com"
      client-id="some-client-id"
      token-name="oooo">
      <span>
        Connect an Account
      </span>
   </PyasConnect> 
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
