<script setup lang="ts">
import { ref } from 'vue'
import { PyasConnect } from '@pyas/connect-vue'
import { readSetup } from './setup'

/*
 * PyasConnect in a Vue app's settings page. What it is given comes from the
 * page's address (see setup.ts), so the end-to-end suite can drive every case.
 */

type Account = { accountId: string; email: string; provider: string }

const setup = readSetup()
const widget = ref<{ open(): Promise<void> } | null>(null)
const log = ref<Array<{ event: string; detail: unknown }>>([])
const accounts = ref<Account[]>([])

const record = (event: string) => (detail?: unknown) => {
  log.value.push({ event, detail: detail ?? null })
}

function onConnected(account: Account) {
  record('connected')(account)
  accounts.value.push(account)
}

function openWidget() {
  void widget.value?.open()
}
</script>

<template>
  <main class="example-page">
    <header>
      <p class="crumb">Acme · Settings</p>
      <h1>Calendars</h1>
    </header>
    <section class="example-card">
      <h2>Your calendars</h2>
      <p>Connect the calendar you work from, so bookings land on it and your busy times are respected.</p>
      <button v-if="setup.hideTrigger" class="example-own-button" @click="openWidget">Add a calendar</button>
      <PyasConnect
        ref="widget"
        v-bind="setup.props"
        @connected="onConnected"
        @error="record('error')($event)"
        @cancel="record('cancel')()"
        @account-connected="record('accountConnected')($event)"
        @connect-error="record('connectError')($event)"
      />
      <ul v-if="accounts.length" class="example-connected" aria-label="Connected calendars">
        <li v-for="a in accounts" :key="a.accountId"><span>{{ a.email }}</span><span>{{ a.provider }}</span></li>
      </ul>
    </section>
    <details class="example-log" :open="log.length > 0">
      <summary>Events</summary>
      <ol data-testid="events">
        <li v-for="(l, i) in log" :key="i" :data-event="l.event">{{ l.event }} {{ JSON.stringify(l.detail) }}</li>
      </ol>
    </details>
  </main>
</template>
