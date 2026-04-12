<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Home, Leaf } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const FORM_STATE_KEY = 'greening_belize_form_state';

const treeId = computed(() => route.query.tree_id as string | undefined);
const treeIds = computed(() => {
  const ids = route.query.tree_ids as string | undefined;
  return ids ? ids.split(',').filter(id => id.trim() !== '') : [];
});
const isBatch = computed(() => treeIds.value.length > 0);

onMounted(() => {
  sessionStorage.removeItem(FORM_STATE_KEY);
});
</script>

<template>
  <div class="block min-h-screen overflow-y-auto bg-slate-50 font-sans dark:bg-slate-900">
    <main class="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-16 sm:px-6">
      <div class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 class="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>

      <div class="text-center">
        <h1 class="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
          {{ isBatch ? `${treeIds.length} Trees Submitted Successfully!` : 'Tree Submitted Successfully!' }}
        </h1>
        <p class="mb-2 text-lg text-muted-foreground">
          Thank you for contributing to Greening Belize.
        </p>
        <p class="text-sm text-muted-foreground">
          {{ isBatch
            ? `Your ${treeIds.length} tree plantings have been recorded and are pending approval.`
            : 'Your tree planting has been recorded and is pending approval.' }}
        </p>
      </div>

      <Card v-if="treeId" class="w-full">
        <CardContent class="p-6">
          <div class="mb-2 flex items-center gap-3">
            <Leaf class="h-5 w-5 text-primary" />
            <p class="text-sm font-medium text-foreground">Submission ID</p>
          </div>
          <p class="font-mono text-2xl font-bold text-primary">#{{ treeId }}</p>
        </CardContent>
      </Card>

      <Card v-if="isBatch" class="w-full">
        <CardContent class="p-6">
          <div class="mb-3 flex items-center gap-3">
            <Leaf class="h-5 w-5 text-primary" />
            <p class="text-sm font-medium text-foreground">Submission IDs ({{ treeIds.length }} trees)</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="id in treeIds"
              :key="id"
              class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              #{{ id }}
            </span>
          </div>
        </CardContent>
      </Card>

      <div class="mt-4 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
        <Button
          @click="router.push('/manage/add')"
          class="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
        >
          <Leaf class="mr-2 h-4 w-4" />
          Add Another Tree
        </Button>
        <Button
          variant="outline"
          @click="router.push('/')"
          class="w-full sm:w-auto"
        >
          <Home class="mr-2 h-4 w-4" />
          Return Home
        </Button>
      </div>

      <div class="mt-8 text-center">
        <p class="text-xs text-muted-foreground">
          Your submission will be reviewed by the Belize Forest Department.
        </p>
      </div>
    </main>
  </div>
</template>
