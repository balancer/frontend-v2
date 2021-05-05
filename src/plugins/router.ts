import { createRouter, createWebHashHistory } from 'vue-router';
import Invest from '@/views/Invest.vue';
import Pool from '@/views/Pool.vue';
import Trade from '@/views/Trade.vue';

const routes: any[] = [
  { path: '/', name: 'home', redirect: { name: 'invest' } },
  { path: '/invest', name: 'invest', component: Invest },
  { path: '/trade/:assetIn?/:assetOut?', name: 'trade', component: Trade },
  { path: '/pool/:id', name: 'pool', component: Pool },
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
