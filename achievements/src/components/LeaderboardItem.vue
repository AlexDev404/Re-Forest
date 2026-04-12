<script setup lang="ts">
import type { LeaderboardEntry } from '@/adapters/leaderboard';
import { useRouter } from 'vue-router';

const props = defineProps<{
  entry: LeaderboardEntry;
  rank: number;
}>();

const router = useRouter();

function viewAchievements() {
  router.push(`/user/${props.entry.Id}`);
}

function getInitials(first: string | null, last: string | null): string {
  return `${(first || '?')[0]}${(last || '?')[0]}`.toUpperCase();
}
</script>

<template>
  <button
    class="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
    @click="viewAchievements"
  >
    <!-- Rank -->
    <span
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
      :class="
        rank === 1
          ? 'bg-accent text-accent-foreground'
          : rank === 2
            ? 'bg-secondary text-secondary-foreground'
            : rank === 3
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
      "
    >
      {{ rank }}
    </span>

    <!-- Avatar -->
    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
      {{ getInitials(entry.FirstName, entry.LastName) }}
    </span>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <p class="truncate font-medium text-card-foreground">
        {{ entry.FirstName }} {{ entry.LastName }}
      </p>
      <p class="text-xs text-muted-foreground">
        {{ entry.treesPlanted }} trees &middot; {{ entry.achievementCount }} achievements
      </p>
    </div>
  </button>
</template>
