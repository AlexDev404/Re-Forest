<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authAdapter } from '@/adapters/auth';

const router = useRouter();

onMounted(async () => {
  await authAdapter.logout();
  setTimeout(() => {
    router.push('/auth/login');
  }, 2000);
});
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <div class="text-center">
      <h1 class="mb-4 text-2xl font-semibold">Logging out...</h1>
      <p class="text-muted-foreground">You will be redirected shortly.</p>
    </div>
  </div>
</template>
