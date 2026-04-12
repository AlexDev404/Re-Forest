<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Separator as SeparatorPrimitive, type SeparatorProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends SeparatorProps {
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  decorative: true,
})
</script>

<template>
  <SeparatorPrimitive
    :orientation="orientation"
    :decorative="decorative"
    :class="cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      props.class,
    )"
  />
</template>
