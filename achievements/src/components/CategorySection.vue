<script setup lang="ts">
import type { AchievementCategory } from '@/adapters/achievements';
import AchievementBadge from './AchievementBadge.vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  category: AchievementCategory;
  userId: number;
}>();

const router = useRouter();

function viewAll() {
  router.push(`/user/${props.userId}/category/${props.category.Id}`);
}
</script>

<template>
  <div class="space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between px-1">
      <div>
        <h2 class="text-base font-semibold text-foreground">{{ category.Name }}</h2>
        <p class="text-xs text-muted-foreground">
          {{ category.unlockedCount }} of {{ category.totalCount }} unlocked
        </p>
      </div>
      <button
        class="text-sm font-medium text-primary"
        @click="viewAll"
      >
        View all
      </button>
    </div>

    <!-- Horizontal scroll of badges -->
    <div class="flex gap-4 overflow-x-auto pb-2 pl-1">
      <AchievementBadge
        v-for="achievement in category.achievements"
        :key="achievement.Id"
        :achievement="achievement"
        size="sm"
        class="shrink-0"
      />
    </div>
  </div>
</template>
