<script setup lang="ts">
import { cn } from '@/lib/utils';
import { CirclePlus, Cog, House } from 'lucide-vue-next';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineProps<{
  user?: { Id: number | null; FirstName: string; LastName: string; Role: number } | null;
}>();

const route = useRoute();
const router = useRouter();

const activeButton = computed(() => {
  const path = route.path.replace(/\//g, '');
  return path || 'home';
});

function handleNavigation(page: string) {
  router.push(`/${page}`);
}
</script>

<template>
  <div :class="cn('flex h-fit items-center justify-between self-stretch rounded-md border bg-primary p-1 w-full text-background shadow-sm lg:justify-center lg:space-x-1')">
    <button
      @click="handleNavigation('')"
      :class="cn(
        'flex cursor-default select-none items-center self-stretch rounded-sm px-3.5 py-2.5 text-sm font-medium outline-none focus:bg-secondary',
        activeButton === 'home' || activeButton === '' ? 'bg-secondary' : ''
      )"
    >
      <House />
    </button>

    <button
      @click="handleNavigation('manage/add')"
      :class="cn(
        'flex w-20 cursor-default select-none items-center justify-center self-stretch rounded-sm px-3.5 py-2.5 text-sm font-medium outline-none focus:bg-secondary',
        activeButton === 'manageadd' || activeButton.includes('manage') ? 'bg-secondary' : ''
      )"
    >
      <CirclePlus />
    </button>

    <button
      @click="handleNavigation('configure')"
      :class="cn(
        'flex cursor-default select-none items-center self-stretch rounded-sm px-3.5 py-2.5 text-sm font-medium outline-none focus:bg-secondary',
        activeButton === 'configure' ? 'bg-secondary' : ''
      )"
    >
      <Cog />
    </button>
  </div>
</template>
