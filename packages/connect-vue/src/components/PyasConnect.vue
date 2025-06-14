<template>
  <div class="pyas-connect" :theme="theme">
    <button class="pyas-button" @click="open = true">
      <slot>Connect a Provider</slot>
    </button>

    <div v-if="open" class="pyas-modal">
      <div class="pyas-modal-content">
        <div class="pyas-modal-header">
            <!-- Step 1 -->
            <div
                v-if="step === 1"
                class="modal-header-row"
            >
            <div>
                <h3>{{ modalTitle }}</h3>
                <p>{{ modalDescription }}</p>
            </div>
            <div
                class="close-modal-wrapper"
                @click="closeModal"
            >
                 <span v-html="CloseIcon"></span>
            </div>
            </div>

            <!-- Step 2 -->
            <template v-else-if="step === 2">
            <div class="modal-header-row step2">
                <span class="form-icon">
                    <span class="icon" v-html="getProviderIcon(selectedProvider)"></span>
                    <span class="provider-label">{{ selectedProviderLabel() }}</span>
                </span>
                <div
                    class="close-modal-wrapper"
                    @click="closeModal"
                    >
                    <span v-html="CloseIcon"></span>
                </div>
            </div>

            <div class="form-header-divider"></div>

            <div class="modal-subheader">
                <h3>{{ formTitle }}</h3>
                <p>{{ formDescription }}</p>
            </div>
            </template>
        </div>

        <!-- Step 1: Providers -->
        <div v-if="step === 1" class="pyas-modal-body">
            <div class="pyas-provider-buttons">
                <ProviderButton
                    v-if="showGoogle"
                    provider="google"
                    label="Google Calendar"
                    :showLabel="showLabels"
                    @click="() => handleProviderClick('google')"
                />
                <ProviderButton
                    v-if="showOutlook"
                    provider="microsoft"
                    label="Microsoft Outlook"
                    :showLabel="showLabels"
                    @click="() => handleProviderClick('microsoft')"
                />
                <ProviderButton
                    v-if="showZoom"
                    provider="zoom"
                    label="Zoom"
                    :showLabel="showLabels"
                    @click="() => handleProviderClick('zoom')"
                />
                <ProviderButton
                    v-if="showIcloud"
                    provider="icloud"
                    label="iCloud Calendar"
                    :showLabel="showLabels"
                    @click="() => handleProviderClick('icloud')"
                />
            </div>
        </div>

        <!-- Step 2: Form -->
        <div v-else class="step-form">
          <div class="step-form-content form-group">
            <label class="form-label">
              <span>Name</span>
              <input
                type="text"
                class="form-input"
                v-model="name"
                :disabled="loading"
                :placeholder="namePlaceholder"
              />
            </label>
            <label class="form-label">
              <span>Email</span>
              <input
                type="email"
                class="form-input"
                v-model="email"
                :disabled="loading"
                :placeholder="emailPlaceholder"
              />
            </label>
          </div>
          <div class="form-actions">
            <button class="form-back" @click="prevStep" :disabled="loading">
              Back
            </button>
            <button class="form-submit" @click="submit" :disabled="loading">
              <span v-if="loading" class="spinner" aria-label="loading" />
              <span v-else>{{ submitLabel }}</span>
            </button>
          </div>
        </div>

        <div v-if="showDisclaimer" class="pyas-disclaimer">
            <div class="divider">
                <hr />
            </div>
          <span>{{ productName }} uses</span>
          <slot name="logo">
            <img class="pyas-logo" :src="logoSrc" alt="Pyas Logo" />
          </slot>
          <span>to securely connect your account</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import '@pyas/connect/dist/theme/main.css';
import { getOauthUrl, openOAuthPopup, renderProviderButton } from '@pyas/connect';
import ProviderButton from '@/components/ProviderButton.vue';
import { CloseIconSvg as CloseIcon } from '@pyas/connect'
import { getProviderIcon } from '@/utils';


const props = defineProps({
  // Required
  clientId:        { type: String, required: true },
  tokenName:       { type: String, required: true },

  // UI Options
  showLabels:      { type: Boolean, default: true },
  theme:           { type: String as () => 'light' | 'dark', default: 'light' },
  modalTitle:      { type: String, default: 'Connect an Account' },
  modalDescription:{ type: String, default: '' },
  formTitle:       { type: String, default: 'Enter Your Details' },
  formDescription: { type: String, default: '' },

  // Providers toggles
  showGoogle:      { type: Boolean, default: true },
  showOutlook:     { type: Boolean, default: true },
  showIcloud:      { type: Boolean, default: false },
  showZoom:        { type: Boolean, default: true },

  // User info
  userEmail:       { type: String, default: '' },
  userName:        { type: String, default: '' },

  // Misc
  showDisclaimer:  { type: Boolean, default: true },
  productName:     { type: String, default: 'This app' },
  state:           { type: String, default: '' },

  // Placeholders & labels (optional overrides)
  namePlaceholder: { type: String, default: 'Your name' },
  emailPlaceholder:{ type: String, default: 'you@example.com' },
  submitLabel:     { type: String, default: 'Continue' },
});

const emit = defineEmits<{
  (e: 'accountConnected', detail: any): void;
  (e: 'connectError', detail: any): void;
}>();

// Reactive UI state
const open     = ref(false);
const step     = ref<1|2>(1);
const name     = ref(props.userName);
const email    = ref(props.userEmail);
const loading  = ref(false);
const selectedProvider = ref<'google'|'microsoft'|'zoom'|'icloud'>('google');

const logoSrc = ref('data:image/svg+xml,%3c?xml%20version=%271.0%27%20encoding=%27UTF-8%27?%3e%3csvg%20id=%27Layer_1%27%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%20183%20100%27%3e%3cdefs%3e%3cstyle%3e.cls-1{fill:%23290066;}.cls-2{fill:%23ff9b19;}.cls-3{fill:%23b70053;}.cls-4{fill:%233d0099;}.cls-5{fill:%230f0b3a;}.cls-6{fill:%23ffd701;}.cls-7{fill:%23fb0062;}%3c/style%3e%3c/defs%3e%3cg%3e%3cpath%20class=%27cls-5%27%20d=%27M96.12,39.39c0,6.17-4.85,10.84-11.17,10.84h-5.18v10.84h-6.5V28.55h11.69c6.32,0,11.17,4.67,11.17,10.84Zm-6.69,0c0-2.69-1.98-4.71-4.62-4.71h-5.04v9.43h5.04c2.64,0,4.62-2.03,4.62-4.71Z%27/%3e%3cpath%20class=%27cls-5%27%20d=%27M124.16,37.03l-13.71,32.99h-6.6l3.86-9.19-9.85-23.8h6.97l6.22,16.35,6.22-16.35h6.88Z%27/%3e%3cpath%20class=%27cls-5%27%20d=%27M150.27,37.03v24.04h-6.13v-3.16c-1.89,2.31-4.57,3.72-7.82,3.72-6.69,0-11.73-5.42-11.73-12.58s5.04-12.58,11.73-12.58c3.25,0,5.94,1.41,7.82,3.72v-3.16h6.13Zm-6.13,12.02c0-3.77-2.83-6.65-6.64-6.65s-6.6,2.87-6.6,6.65,2.83,6.64,6.6,6.64,6.64-2.87,6.64-6.64Z%27/%3e%3cpath%20class=%27cls-5%27%20d=%27M154.6,53.86h6.17c0,1.51,1.27,2.73,2.87,2.73,1.51,0,2.69-.94,2.69-2.17,0-1.65-1.84-2.45-4.01-3.02-3.58-.85-7.4-2.69-7.4-7.54s4.01-7.4,8.62-7.4c4.95,0,8.67,3.3,8.67,7.4h-6.17c0-1.27-1.08-2.36-2.54-2.36-1.32,0-2.4,.9-2.4,1.98,0,1.51,1.7,2.4,4.19,3.02,3.72,.94,7.26,2.78,7.26,7.4,0,4.9-4.05,7.73-8.95,7.73-5.18,0-9-3.49-9-7.78Z%27/%3e%3c/g%3e%3cg%3e%3cpath%20class=%27cls-6%27%20d=%27M54.12,30.12H16.82c-.31-.48-.49-1.04-.49-1.65V8.39c0-1,.81-1.81,1.82-1.81,.37,0,.72,.11,1.01,.3,0,0,.01,0,.02,.01l31.39,20.38,1.13,.74h0c.87,.63,1.68,1.33,2.42,2.11Z%27/%3e%3cpath%20class=%27cls-4%27%20d=%27M23.35,39.35s-.09-.06-.14-.09l-12.37-8.03s-.05-.03-.07-.05c-.28-.18-.61-.28-.97-.28-1,0-1.81,.81-1.81,1.82v57.47c0,1,.81,1.82,1.81,1.82,.42,0,.8-.14,1.11-.38,.02-.01,.03-.03,.05-.04l12.48-9.75s.08-.06,.11-.09c.34-.28,.62-.64,.82-1.05,.19-.39,.29-.83,.29-1.3V41.85c0-1.04-.52-1.96-1.32-2.5Z%27/%3e%3cpath%20class=%27cls-2%27%20d=%27M58.31,38.19H28.28c-.22-.33-.49-.62-.82-.85-.02-.02-.04-.03-.07-.05l-9.68-6.29s-.04-.03-.06-.04c-.33-.23-.62-.52-.83-.86H54.12c2.09,2.2,3.57,4.98,4.19,8.08Z%27/%3e%3cpath%20class=%27cls-7%27%20d=%27M58.63,41.44c0,4.98-2.21,9.44-5.7,12.45-.03,.03-.06,.05-.1,.08,0,0-14.65,11.44-21.09,16.48-.01,0-.02,.02-.04,.03-.31,.25-.71,.39-1.13,.39-1,0-1.81-.81-1.81-1.82v-29.22c0-.61-.18-1.17-.49-1.65h30.03c.21,1.05,.32,2.13,.32,3.24Z%27/%3e%3cpath%20class=%27cls-3%27%20d=%27M28.76,43.28v-3.44c0-.61-.18-1.17-.49-1.65h30.03l-29.54,5.09Z%27/%3e%3cpath%20class=%27cls-1%27%20d=%27M24.38,80.69c-.19,.41-.47,.76-.82,1.05-.04,.03-.08,.06-.11,.09l-12.48,9.75s-.03,.03-.05,.04c-.31,.24-.69,.38-1.11,.38-1,0-1.81-.81-1.81-1.82V32.72c0,27.4,7.06,37.35,16.39,47.98Z%27/%3e%3c/g%3e%3c/svg%3e')

// Sync if parent updates userName/userEmail
watch(() => props.userName, val => name.value = val);
watch(() => props.userEmail, val => email.value = val);

const renderBtn = (provider: string, label: string) => {
  renderProviderButton(provider as any, label, props.showLabels, () => step.value = 2);
}

const closeModal = () => {
    open.value = false;
    step.value = 1;
    loading.value = false;
    name.value = props.userName;
    email.value = props.userEmail;
}

const prevStep = () => {
    step.value = 1;
}

const handleProviderClick = (provider: 'google'|'microsoft'|'zoom'|'icloud') => {
    selectedProvider.value = provider;
    step.value = 2;
};
const selectedProviderLabel = () => {
    switch (selectedProvider.value) {
        case 'google': return 'Google Calendar';
        case 'microsoft': return 'Microsoft Outlook';
        case 'zoom': return 'Zoom';
        case 'icloud': return 'iCloud Calendar';
        default: return '';
    }
};

async function submit() {
    loading.value = true;
    const payload = {
        provider:   selectedProvider.value,
        clientId:   props.clientId,
        tokenName:  props.tokenName,
        state:      props.state,
        email:      email.value,
        name:       name.value
    };
    const res = await getOauthUrl(payload);
    if (!res?.success) {
        loading.value = false;
        emit('connectError', res?.error);
        return;
    }
    const popupRes = await openOAuthPopup({ ...payload, url: res.url! });
    loading.value = false;
    if (popupRes.success) emit('accountConnected', popupRes.account);
    else emit('connectError', popupRes?.error);
}
</script>

<style scoped>
.pyas-connect .pyas-logo {
    position: relative;
    top: 0.1rem;
}

.modal-header-row.step2{
    padding-top: 1rem;
}

.form-icon .icon {
    width: 3rem;
    height: 3rem;

}
</style>
