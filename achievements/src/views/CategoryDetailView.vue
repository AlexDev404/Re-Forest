<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { achievementsAdapter, type AchievementCategory } from '@/adapters/achievements';
import AchievementBadge from '@/components/AchievementBadge.vue';
import { ArrowLeft } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const category = ref<AchievementCategory | null>(null);
const loading = ref(true);
const error = ref('');
const userId = Number(route.params.userId);
const categoryId = Number(route.params.categoryId);

onMounted(async () => {
  try {
    const data = await achievementsAdapter.getUserCategoryAchievements(userId, categoryId);
    category.value = data.category;
  } catch (e: any) {
    error.value = e.message || 'Failed to load category';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-4 backdrop-blur">
      <div class="flex items-center gap-3">
        <button
          class="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
          @click="router.back()"
        >
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-foreground">
            {{ category?.Name || 'Loading...' }}
          </h1>
          <p v-if="category" class="text-xs text-muted-foreground">
            {{ category.unlockedCount }} of {{ category.totalCount }} unlocked
          </p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 py-6">
      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 gap-6">
        <div v-for="i in 6" :key="i" class="flex flex-col items-center gap-2">
          <div class="h-28 w-28 animate-pulse rounded-full bg-muted" />
          <div class="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <!-- Error -->
      <p v-else-if="error" class="py-12 text-center text-sm text-destructive">
        {{ error }}
      </p>

      <!-- Grid of badges -->
      <div v-else-if="category" class="grid grid-cols-2 gap-6">
        <AchievementBadge
          v-for="achievement in category.achievements"
          :key="achievement.Id"
          :achievement="achievement"
          size="lg"
        />
      </div>
    </div>
  </div>
</template>
