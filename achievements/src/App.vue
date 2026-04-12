<script setup lang="ts">
import EmbeddedNav from '@/components/EmbeddedNav.vue';
</script>

<template>
  <div class="min-h-screen bg-background pb-16 font-sans">
    <router-view v-slot="{ Component }">
      <transition name="slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <EmbeddedNav />
  </div>
</template>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
