<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { House, CirclePlus, Settings } from 'lucide-vue-next';

defineProps<{
  user?: { Id: number | null; FirstName: string; LastName: string; Role: number } | null;
}>();

const route = useRoute();
const router = useRouter();

const activeButton = computed(() => {
  const path = route.path.replace(/^\//, '');
  return path || 'home';
});

function handleNavigation(page: string) {
  router.push(`/${page}`);
}
</script>

<template>
  <div class="flex w-full items-center justify-around rounded-xl border border-border bg-card p-1 shadow-lg backdrop-blur">
    <button
      @click="handleNavigation('')"
      class="flex flex-1 items-center justify-center rounded-lg p-3 transition-colors"
      :class="activeButton === 'home' || activeButton === '' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'"
    >
      <House :size="20" />
    </button>
    <button
      @click="handleNavigation('manage/add')"
      class="flex w-20 items-center justify-center rounded-lg p-3 transition-colors"
      :class="activeButton.includes('manage') ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'"
    >
      <CirclePlus :size="20" />
    </button>
    <button
      @click="handleNavigation('configure')"
      class="flex flex-1 items-center justify-center rounded-lg p-3 transition-colors"
      :class="activeButton === 'configure' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'"
    >
      <Settings :size="20" />
    </button>
  </div>
</template>
