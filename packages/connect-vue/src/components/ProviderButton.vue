<template>
  <button class="pyas-provider-button" @click="$emit('click')">
    <span class="icon" v-html="icon"></span>
    <span v-if="showLabel" class="label">{{ label }}</span>
    <span class="arrow">
        <span class="arrow">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="arrow-icon"
            >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
            </svg>
        </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getProviderIcon } from '../utils';

const props = defineProps({
  /** one of 'google' | 'microsoft' | 'zoom' | 'icloud' */
  provider: { type: String as () => 'google'|'microsoft'|'zoom'|'icloud', required: true },
  /** Button label text */
  label:    { type: String, required: true },
  /** Show/hide the text label */
  showLabel:{ type: Boolean, default: true },
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const icon = computed(() => getProviderIcon(props.provider) || '');
</script>
