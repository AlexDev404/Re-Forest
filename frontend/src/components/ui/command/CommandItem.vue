<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ComboboxItem, type ComboboxItemProps, ComboboxItemIndicator } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<ComboboxItemProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ComboboxItem
    v-bind="props"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      props.class,
    )"
  >
    <slot />
  </ComboboxItem>
</template>
