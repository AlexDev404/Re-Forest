<script setup lang="ts">
import type { Achievement } from '@/adapters/achievements';

const props = defineProps<{
  achievement: Achievement;
  size?: 'sm' | 'lg';
}>();

const badgeSize = props.size === 'lg' ? 'h-28 w-28' : 'h-20 w-20';
const textSize = props.size === 'lg' ? 'text-sm' : 'text-xs';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
}
</script>

<template>
  <div class="flex flex-col items-center gap-1.5">
    <!-- Badge circle -->
    <div
      class="flex items-center justify-center rounded-full border-[3px] text-3xl"
      :class="[
        badgeSize,
        achievement.unlocked
          ? 'border-accent bg-secondary/20'
          : 'border-muted bg-muted'
      ]"
    >
      <span
        :class="achievement.unlocked ? '' : 'grayscale opacity-40'"
      >
        {{ achievement.Icon || '?' }}
      </span>
    </div>
    <!-- Label -->
    <span
      :class="[
        textSize,
        'text-center font-medium leading-tight',
        achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
      ]"
    >
      {{ achievement.Name }}
    </span>
    <!-- Date -->
    <span
      v-if="achievement.unlocked && achievement.unlockedAt"
      class="text-[10px] text-muted-foreground"
    >
      {{ formatDate(achievement.unlockedAt) }}
    </span>
  </div>
</template>
