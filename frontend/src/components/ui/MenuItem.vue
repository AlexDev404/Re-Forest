<script setup lang="ts">
import { computed } from 'vue';
import { twMerge } from 'tailwind-merge';

const props = withDefaults(
  defineProps<{
    title: string;
    class?: string;
  }>(),
  { class: '' }
);

const menuItemClasses = computed(() =>
  twMerge(
    'flex w-full cursor-pointer items-center justify-between border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted',
    props.class
  )
);
</script>

<template>
  <div :class="menuItemClasses" @click="$emit('click')">
    <div class="flex items-center gap-3">
      <slot name="start-icon" />
      <span class="text-sm font-medium">{{ title }}</span>
    </div>
    <slot />
  </div>
</template>
