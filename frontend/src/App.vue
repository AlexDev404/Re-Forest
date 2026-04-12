<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavigationBar from '@/components/app/NavigationBar.vue';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-vue-next';
import { requestNotificationPermission } from '@/composables/firebase';
import { authAdapter } from '@/adapters/auth';

const route = useRoute();
const router = useRouter();
const loadingBarRef = ref<HTMLDivElement | null>(null);
const mobile = ref(false);
const user = ref<{ Id: number | null; FirstName: string; LastName: string; Role: number } | null>(null);

const showNav = computed(() => route.meta.showNav === true);

// Loading bar: show on beforeEach, hide on afterEach (matching SvelteKit beforeNavigate/afterNavigate)
router.beforeEach((_to, _from, next) => {
  if (loadingBarRef.value) {
    loadingBarRef.value.style.opacity = '1';
  }
  next();
});

router.afterEach(() => {
  setTimeout(() => {
    loadingBarRef.value?.classList.add('animate-fade-out');
  }, 1115);
  setTimeout(() => {
    if (loadingBarRef.value) {
      loadingBarRef.value.style.opacity = '0';
      loadingBarRef.value.classList.remove('animate-fade-out');
    }
  }, 1125);
});

onMounted(async () => {
  // Hide loading bar initially
  if (loadingBarRef.value) {
    loadingBarRef.value.style.opacity = '0';
  }

  // Fade out and remove splash screen (matching SvelteKit onMount behavior)
  const splashScreen = document.getElementById('splash-screen');
  setTimeout(() => {
    splashScreen?.classList.add('animate-fade-out');
  }, 1000);
  setTimeout(() => {
    splashScreen?.remove();
  }, 2000);

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
          <CircleX :size="48" class="mx-auto mb-4" />
          <h1 class="mb-2 text-2xl font-bold">Nope!</h1>
          <p class="text-gray-600">
            This app is designed for mobile devices. Please use a mobile device or open the device emulator in your browser.
          </p>
          <Button
            class="mt-4"
            size="lg"
            @click="forceEnableMobile"
          >
            Whatever
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
