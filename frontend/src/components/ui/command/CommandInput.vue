<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ComboboxInput, type ComboboxInputProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<ComboboxInputProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<{
  input: [value: string]
}>()
</script>

<template>
  <ComboboxInput
    v-bind="props"
    :class="cn('flex h-11 w-full rounded-md bg-transparent py-3 px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50', props.class)"
    @input="emits('input', ($event.target as HTMLInputElement).value)"
  />
</template>
