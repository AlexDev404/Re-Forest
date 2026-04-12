<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { leaderboardAdapter, type LeaderboardEntry } from '@/adapters/leaderboard';
import LeaderboardItem from '@/components/LeaderboardItem.vue';

const entries = ref<LeaderboardEntry[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const data = await leaderboardAdapter.getLeaderboard();
    entries.value = data.leaderboard;
  } catch (e: any) {
    error.value = e.message || 'Failed to load leaderboard';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-4 backdrop-blur">
      <h1 class="text-xl font-bold text-foreground">Leaderboard</h1>
    </div>

    <!-- Content -->
    <div class="px-4 py-4">
      <!-- Loading -->
      <div v-if="loading" class="space-y-3">
        <div
          v-for="i in 6"
          :key="i"
          class="h-16 animate-pulse rounded-lg bg-muted"
        />
      </div>

      <!-- Error -->
      <p v-else-if="error" class="py-12 text-center text-sm text-destructive">
        {{ error }}
      </p>

      <!-- Empty -->
      <p v-else-if="entries.length === 0" class="py-12 text-center text-sm text-muted-foreground">
        No users found.
      </p>

      <!-- List -->
      <div v-else class="space-y-2">
        <LeaderboardItem
          v-for="(entry, index) in entries"
          :key="entry.Id"
          :entry="entry"
          :rank="index + 1"
        />
      </div>
    </div>
  </div>
</template>
