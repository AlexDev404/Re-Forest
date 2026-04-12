<script setup lang="ts">
const props = defineProps<{
  value: string;
  id?: string;
  checked?: boolean;
}>();

const emit = defineEmits<{
  select: [value: string];
}>();
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="checked"
    :id="id"
    class="aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    @click="emit('select', value)"
  >
    <span v-if="checked" class="flex items-center justify-center">
      <svg width="10" height="10" viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="4" fill="currentColor" />
      </svg>
    </span>
  </button>
</template>
