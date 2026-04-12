<script setup lang="ts">
import { computed } from 'vue';
import { twMerge } from 'tailwind-merge';

const props = withDefaults(
  defineProps<{
    for?: string;
    class?: string;
  }>(),
  { class: '' }
);

const labelClasses = computed(() =>
  twMerge(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    props.class
  )
);
</script>

<template>
  <label :for="props.for" :class="labelClasses">
    <slot />
  </label>
</template>
