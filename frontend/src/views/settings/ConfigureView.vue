<script setup lang="ts">
import { authAdapter } from '@/adapters/auth';
import MenuItem from '@/components/app/MenuItem.vue';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronRight, DoorOpen, Map, Shield, Thermometer } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const checked = ref(false);
const authenticated = ref(false);

onMounted(() => {
  const unitcheck = JSON.parse(localStorage.getItem('units') ?? 'false');
  const isUnset = localStorage.getItem('units') === null;
  checked.value = true;
  if (!unitcheck && !isUnset) {
    checked.value = unitcheck;
  }
  authenticated.value = authAdapter.isAuthenticated();
});

function onclickUnits() {
  checked.value = !checked.value;
  localStorage.setItem('units', JSON.stringify(checked.value));
}
</script>

<template>
  <div class="min-h-screen overflow-y-auto">
    <main class="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-16">
      <header class="pb-6 sm:pb-8">
        <h1 class="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Settings</h1>
        <p class="mt-1 text-sm text-muted-foreground">Manage your application preferences and configuration.</p>
      </header>

      <div class="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow">
        <MenuItem title="Unit Scale" @click="onclickUnits"
          class="transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/60">
          <template #start-icon>
            <Thermometer class="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </template>
          <div class="flex cursor-pointer items-center space-x-2" @click.stop="onclickUnits">
            <Label class="cursor-pointer text-sm text-slate-700 dark:text-slate-300">Metric</Label>
            <Switch :checked="checked" @update:checked="() => onclickUnits()" />
            <Label class="cursor-pointer text-sm text-slate-700 dark:text-slate-300">Imperial</Label>
          </div>
        </MenuItem>

        <MenuItem title="Site Location" @click="router.push('/configure/site-location')"
          class="transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/60">
          <template #start-icon>
            <Map class="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </template>
          <ChevronRight class="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </MenuItem>
      </div>

      <div class="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow sm:mt-8">
        <MenuItem v-if="!authenticated" title="Sign In" @click="router.push('/auth/login')"
          class="transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/60">
          <template #start-icon>
            <Shield class="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </template>
          <ChevronRight class="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </MenuItem>
        <MenuItem v-else title="Sign Out" @click="router.push('/auth/logout')"
          class="text-red-600 transition-colors duration-150 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-700/30">
          <template #start-icon>
            <DoorOpen class="h-5 w-5" />
          </template>
          <ChevronRight class="h-5 w-5" />
        </MenuItem>
      </div>
    </main>
  </div>
</template>

<style scoped>
:deep(body) {
  overflow: auto;
}
</style>
