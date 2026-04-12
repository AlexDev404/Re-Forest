<script setup lang="ts">
import { computed } from 'vue';
import { twMerge } from 'tailwind-merge';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    id?: string;
    class?: string;
  }>(),
  { modelValue: false, class: '' }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const switchClasses = computed(() =>
  twMerge(
    'peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
    props.modelValue ? 'bg-primary' : 'bg-input',
    props.class
  )
);

function toggle() {
  emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <button :id="id" type="button" role="switch" :aria-checked="modelValue" :class="switchClasses" @click="toggle">
    <span
      :class="[
        'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
        modelValue ? 'translate-x-5' : 'translate-x-0'
      ]"
    />
  </button>
</template>
