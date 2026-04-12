<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ComboboxRoot, type ComboboxRootProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<ComboboxRootProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ComboboxRoot
    v-bind="props"
    :class="cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', props.class)"
  >
    <slot />
  </ComboboxRoot>
</template>
