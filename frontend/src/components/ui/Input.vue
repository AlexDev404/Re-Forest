<script setup lang="ts">
import { computed } from 'vue';
import { twMerge } from 'tailwind-merge';

const props = withDefaults(
  defineProps<{
    type?: string;
    placeholder?: string;
    modelValue?: string | number;
    id?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    class?: string;
  }>(),
  {
    type: 'text',
    class: ''
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const inputClasses = computed(() =>
  twMerge(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    props.class
  )
);
</script>

<template>
  <input
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    :id="id"
    :name="name"
    :disabled="disabled"
    :required="required"
    :min="min"
    :max="max"
    :step="step"
    :class="inputClasses"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
