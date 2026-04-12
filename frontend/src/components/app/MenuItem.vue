<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  title: string
  class?: HTMLAttributes['class']
}>(), { class: '' })

const emit = defineEmits(['click'])

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') emit('click')
}
</script>

<template>
  <div
    :class="cn(
      'flex w-full cursor-pointer items-center rounded-sm border border-slate-100 px-2 py-1.5 text-sm outline-none hover:bg-secondary hover:text-foreground data-[highlighted]:bg-secondary data-[state=open]:bg-secondary',
      props.class
    )"
    role="menuitem"
    tabindex="0"
    aria-expanded="false"
    @click="$emit('click')"
    @keydown="handleKeydown"
  >
    <div class="flex items-center space-x-2">
      <span class="ml-auto">
        <slot name="start-icon" />
      </span>
      <span>{{ title }}</span>
    </div>
    <span class="ml-auto">
      <slot />
    </span>
  </div>
</template>
