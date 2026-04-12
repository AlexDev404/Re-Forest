<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { RadioGroupRoot, type RadioGroupRootEmits, type RadioGroupRootProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<RadioGroupRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<RadioGroupRootEmits>()
</script>

<template>
  <RadioGroupRoot
    v-bind="props"
    :class="cn('grid gap-2', props.class)"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <slot />
  </RadioGroupRoot>
</template>
