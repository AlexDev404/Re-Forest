<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NavigationBar from '@/components/app/NavigationBar.vue';
import { requestNotificationPermission } from '@/composables/firebase';
import { authAdapter } from '@/adapters/auth';

const route = useRoute();
const loadingBarRef = ref<HTMLDivElement | null>(null);
const mobile = ref(false);
const user = ref<{ Id: number | null; FirstName: string; LastName: string; Role: number } | null>(null);

const showNav = computed(() => route.meta.showNav === true);

onMounted(async () => {
  // Remove splash screen
  const splash = document.getElementById('splash-screen');
  if (splash) {
    setTimeout(() => splash.remove(), 2000);
  }

  // Mobile detection
  mobile.value = localStorage.getItem('mobile') === 'true';

  // Register Firebase service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((reg) => console.log('Firebase SW registered:', reg.scope))
      .catch((err) => console.error('SW registration failed:', err));
  }

  // Request notification permission
  try {
    await requestNotificationPermission();
  } catch (e) {
    console.error('Notification permission error:', e);
  }

  // Load current user
  try {
    const data = await authAdapter.me();
    user.value = data.user;
  } catch {
    user.value = null;
  }
});

function forceEnableMobile() {
  localStorage.setItem('mobile', 'true');
  window.location.reload();
}
</script>

<template>
  <div class="h-full w-full">
    <!-- Loading bar -->
    <div
      ref="loadingBarRef"
      class="loading-bar overflow-clip"
      style="height: 3px; width: 100%; position: fixed; top: 0; right: 0; opacity: 0; z-index: 1000"
    >
      <div style="height: 3px; animation: loading2 3s ease-out 1" class="loading-gradient-2">
        <div
          style="height: 3px; animation: loading 3s ease-out infinite"
          class="loading-gradient w-full origin-right delay-0 duration-1000 ease-linear"
        ></div>
      </div>
    </div>

    <!-- Mobile content -->
    <div :class="mobile ? '' : 'lg:hidden'" class="block">
      <router-view v-slot="{ Component }">
        <transition name="slide" mode="out-in">
          <component :is="Component" :user="user" />
        </transition>
      </router-view>

      <!-- Navigation -->
      <div
        v-if="showNav"
        class="nav-control fixed bottom-2 z-10 w-full px-3"
        :class="mobile ? '' : 'lg:hidden'"
      >
        <NavigationBar :user="user" />
      </div>
    </div>

    <!-- Desktop warning -->
    <div v-if="!mobile" class="hidden lg:block">
      <div class="flex h-screen w-full items-center justify-center">
        <div class="max-w-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto mb-4"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <h1 class="mb-2 text-2xl font-bold">Nope!</h1>
          <p class="text-gray-600">
            This app is designed for mobile devices. Please use a mobile device or open the device emulator in your browser.
          </p>
          <button
            class="mt-4 rounded-md bg-primary px-6 py-3 text-primary-foreground"
            @click="forceEnableMobile"
          >
            Whatever
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
