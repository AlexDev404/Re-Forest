<script setup lang="ts">
import { computed } from 'vue';
import { twMerge } from 'tailwind-merge';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    name?: string;
    class?: string;
  }>(),
  { class: '' }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const groupClasses = computed(() => twMerge('flex flex-col gap-2', props.class));
</script>

<template>
  <div :class="groupClasses" role="radiogroup">
    <slot :modelValue="modelValue" :update="(val: string) => emit('update:modelValue', val)" />
  </div>
</template>
