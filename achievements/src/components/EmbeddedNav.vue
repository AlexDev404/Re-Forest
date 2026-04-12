<script setup lang="ts">
import { cn } from '@/lib/utils';
import { CirclePlus, Cog, House, Trophy } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';

const isEmbedded = ref(false);

onMounted(() => {
  isEmbedded.value = window.location.pathname.startsWith('/static/achievements/');
});

const btnBase = 'flex cursor-default select-none items-center self-stretch rounded-sm px-3.5 py-2.5 text-sm font-medium outline-none focus:bg-secondary';
</script>

<template>
  <div
    v-if="isEmbedded"
    class="nav-control fixed bottom-2 z-10 w-full px-3"
  >
    <div :class="cn('flex h-fit items-center justify-between self-stretch rounded-md border bg-primary p-1 w-full text-background shadow-sm')">
      <a href="/" :class="cn(btnBase)">
        <House />
      </a>

      <a href="/manage/add" :class="cn(btnBase, 'w-20 justify-center')">
        <CirclePlus />
      </a>

      <a href="/static/achievements/index.html" :class="cn(btnBase, 'bg-secondary')">
        <Trophy />
      </a>

      <a href="/configure" :class="cn(btnBase)">
        <Cog />
      </a>
    </div>
  </div>
</template>

<style scoped>
.nav-control {
  display: flex;
  justify-content: space-between;
}
</style>
