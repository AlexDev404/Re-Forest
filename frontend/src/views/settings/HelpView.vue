<script setup lang="ts">
// Help page
</script>

<template>
  <div class="overflow-y-auto">
    <main class="mx-6 my-10 flex min-h-[80vh] flex-col items-start gap-9">
      <article class="flex flex-col items-start self-stretch">
        <h1 class="text-2xl font-semibold">
          <router-link to="/configure">Settings</router-link> <span> &gt; Help</span>
        </h1>
        <br />
        <h2 class="text-xl font-semibold">Who are we?</h2>
        <p>
          We are a group of students from the University of Belize. We are currently studying
          Information Technology and we are in our first year of our Bachelor Program. We are working
          on a project called Greening Belize, which is a web application that aims to help users to plant
          trees and to learn more about the environment.
        </p>
        <br />
        <h2 class="text-xl font-semibold">How to use this app?</h2>
        <p>
          When you first open the app, you will be taken to the home page. Here you can see the map of
          the world with all the trees that have been planted. You can click on the trees to see more
          information about them. You can also use the search bar to search for a specific tree.
        </p>
      </article>
    </main>
  </div>
</template>

<style scoped>
:deep(body) {
  overflow: auto;
}
</style>
