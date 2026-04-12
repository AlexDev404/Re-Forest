<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useForwardProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
  type?: string
  placeholder?: string
  id?: string
  name?: string
  disabled?: boolean
  required?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
}>()

const emits = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    :type="type ?? 'text'"
    :value="modelValue"
    :placeholder="placeholder"
    :id="id"
    :name="name"
    :disabled="disabled"
    :required="required"
    :min="min"
    :max="max"
    :step="step"
    :class="cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', props.class)"
    @input="emits('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
