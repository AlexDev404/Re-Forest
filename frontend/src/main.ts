import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './assets/main.css';

// Route components
import LoginView from './views/auth/LoginView.vue';
import RegisterView from './views/auth/RegisterView.vue';
import LogoutView from './views/auth/LogoutView.vue';
import HomeView from './views/app/HomeView.vue';
import AddTreeView from './views/app/AddTreeView.vue';
import ConfigureView from './views/settings/ConfigureView.vue';
import SiteLocationView from './views/settings/SiteLocationView.vue';
import HelpView from './views/settings/HelpView.vue';
import ConfirmationView from './views/app/ConfirmationView.vue';

const routes = [
  { path: '/auth/login', name: 'login', component: LoginView, meta: { auth: false } },
  { path: '/auth/register', name: 'register', component: RegisterView, meta: { auth: false } },
  { path: '/auth/logout', name: 'logout', component: LogoutView },
  { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: false, showNav: true } },
  { path: '/manage/add', name: 'add-tree', component: AddTreeView, meta: { requiresAuth: true, showNav: true } },
  { path: '/configure', name: 'configure', component: ConfigureView, meta: { showNav: true } },
  { path: '/configure/site-location', name: 'site-location', component: SiteLocationView, meta: { showNav: true } },
  { path: '/configure/help', name: 'help', component: HelpView, meta: { showNav: true } },
  { path: '/confirmation', name: 'confirmation', component: ConfirmationView, meta: { showNav: false } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard for auth
router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem('auth_token');
  const isAuthenticated = !!token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth/login');
  } else if (to.meta.auth === false && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

const app = createApp(App);
app.use(router);
app.mount('#app');
