<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { RadioGroupIndicator, RadioGroupItem, type RadioGroupItemProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<RadioGroupItemProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <RadioGroupItem
    v-bind="props"
    :class="cn(
      'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      props.class,
    )"
  >
    <RadioGroupIndicator class="flex items-center justify-center">
      <svg width="10" height="10" viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="4" fill="currentColor" />
      </svg>
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
