import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Pool from '@/views/Pool.vue';
import Portfolio from '@/views/Portfolio.vue';
import Trade from '@/views/Trade.vue';

const routes: any[] = [
  { path: '/', name: 'home', component: Home },
  { path: '/trade/:assetIn?/:assetOut?', name: 'trade', component: Trade },
  { path: '/pool/:id', name: 'pool', component: Pool },
  { path: '/portfolio', name: 'portfolio', component: Portfolio },
  { path: '/*', name: 'error-404', beforeEnter: (to, from, next) => next('/') }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
