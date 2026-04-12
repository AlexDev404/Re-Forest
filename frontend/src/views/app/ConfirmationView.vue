<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import Button from '@/components/ui/Button.vue';

const route = useRoute();
const router = useRouter();

const treeId = computed(() => route.query.tree_id as string | undefined);
const treeIds = computed(() => route.query.tree_ids as string | undefined);

const isBatch = computed(() => !!treeIds.value);
const batchCount = computed(() => treeIds.value?.split(',').length ?? 0);
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
    <div class="max-w-md text-center">
      <div class="mb-6 flex items-center justify-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
      </div>
      <h1 class="mb-3 text-2xl font-semibold text-foreground">
        {{ isBatch ? 'Trees Planted Successfully!' : 'Tree Planted Successfully!' }}
      </h1>
      <p class="mb-8 text-muted-foreground">
        <template v-if="isBatch">
          Your {{ batchCount }} trees have been submitted and are pending review.
        </template>
        <template v-else>
          Your tree (ID: {{ treeId }}) has been submitted and is pending review.
        </template>
      </p>
      <div class="flex flex-col gap-3">
        <Button @click="router.push('/manage/add')" class="w-full">Plant Another Tree</Button>
        <Button variant="outline" @click="router.push('/')" class="w-full">Go Home</Button>
      </div>
    </div>
  </div>
</template>
