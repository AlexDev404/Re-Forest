<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { achievementsAdapter, type AchievementCategory } from '@/adapters/achievements';
import CategorySection from '@/components/CategorySection.vue';
import { ArrowLeft } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const categories = ref<AchievementCategory[]>([]);
const loading = ref(true);
const error = ref('');
const userId = Number(route.params.userId);

onMounted(async () => {
  try {
    const data = await achievementsAdapter.getUserAchievements(userId);
    categories.value = data.categories;
  } catch (e: any) {
    error.value = e.message || 'Failed to load achievements';
  } finally {
    loading.value = false;
  }
});

const totalUnlocked = () => categories.value.reduce((sum, c) => sum + c.unlockedCount, 0);
const totalCount = () => categories.value.reduce((sum, c) => sum + c.totalCount, 0);
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
          <h1 class="text-xl font-bold text-foreground">Achievements</h1>
          <p v-if="!loading" class="text-xs text-muted-foreground">
            {{ totalUnlocked() }} of {{ totalCount() }} unlocked
          </p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 py-4">
      <!-- Loading -->
      <div v-if="loading" class="space-y-6">
        <div v-for="i in 3" :key="i" class="space-y-3">
          <div class="h-5 w-32 animate-pulse rounded bg-muted" />
          <div class="flex gap-4">
            <div v-for="j in 4" :key="j" class="h-20 w-20 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>

      <!-- Error -->
      <p v-else-if="error" class="py-12 text-center text-sm text-destructive">
        {{ error }}
      </p>

      <!-- Categories -->
      <div v-else class="space-y-6">
        <CategorySection
          v-for="category in categories"
          :key="category.Id"
          :category="category"
          :userId="userId"
        />
      </div>
    </div>
  </div>
</template>
