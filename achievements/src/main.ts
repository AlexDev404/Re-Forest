import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './assets/main.css';

import LeaderboardView from './views/LeaderboardView.vue';
import UserAchievementsView from './views/UserAchievementsView.vue';
import CategoryDetailView from './views/CategoryDetailView.vue';

const routes = [
  { path: '/', name: 'leaderboard', component: LeaderboardView },
  { path: '/user/:userId', name: 'user-achievements', component: UserAchievementsView },
  { path: '/user/:userId/category/:categoryId', name: 'category-detail', component: CategoryDetailView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

const app = createApp(App);
app.use(router);
app.mount('#app');
