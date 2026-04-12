<script setup lang="ts">
import type { Achievement } from '@/adapters/achievements';
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTrigger
} from 'radix-vue';
import { X } from 'lucide-vue-next';

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

const thresholdLabels: Record<string, (n: number) => string> = {
  TREES_PLANTED: (n) => `Plant ${n} tree${n === 1 ? '' : 's'}`,
  SPECIES_COUNT: (n) => `Plant ${n} different tree species`,
  AREA_HECTARES: (n) => `Cover ${n} hectare${n === 1 ? '' : 's'} of planted area`,
  DAYS_ACTIVE: (n) => `Plant trees on ${n} different day${n === 1 ? '' : 's'}`
};

function getUnlockRequirement(a: Achievement): string {
  const fn = thresholdLabels[a.ThresholdType];
  if (!fn) return a.Description || '';
  return fn(a.Threshold ?? 1);
}
</script>

<template>
  <DialogRoot>
    <DialogTrigger as-child>
      <button class="flex flex-col items-center gap-1.5 focus:outline-none">
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
      </button>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/60" />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <!-- Close button -->
        <DialogClose
          class="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X :size="16" />
        </DialogClose>

        <div class="flex flex-col items-center gap-4 text-center">
          <!-- Large badge -->
          <div
            class="flex h-24 w-24 items-center justify-center rounded-full border-[3px] text-5xl"
            :class="
              achievement.unlocked
                ? 'border-accent bg-secondary/20'
                : 'border-muted bg-muted'
            "
          >
            <span :class="achievement.unlocked ? '' : 'grayscale opacity-40'">
              {{ achievement.Icon || '?' }}
            </span>
          </div>

          <!-- Name -->
          <h2 class="text-lg font-bold text-card-foreground">
            {{ achievement.Name }}
          </h2>

          <!-- Description -->
          <p v-if="achievement.Description" class="text-sm text-muted-foreground">
            {{ achievement.Description }}
          </p>

          <!-- Unlock requirement -->
          <div
            class="w-full rounded-md border border-border px-4 py-3"
            :class="achievement.unlocked ? 'bg-secondary/10' : 'bg-muted'"
          >
            <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {{ achievement.unlocked ? 'Completed' : 'How to unlock' }}
            </p>
            <p class="mt-1 text-sm font-medium text-card-foreground">
              {{ getUnlockRequirement(achievement) }}
            </p>
          </div>

          <!-- Unlock date -->
          <p
            v-if="achievement.unlocked && achievement.unlockedAt"
            class="text-xs text-muted-foreground"
          >
            Unlocked on {{ formatDate(achievement.unlockedAt) }}
          </p>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
