import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Pool from '@/views/Pool.vue';
import Trade from '@/views/Trade.vue';

const routes: any[] = [
  { path: '/', name: 'home', component: Home },
  { path: '/trade/:assetIn?/:assetOut?', name: 'trade', component: Trade },
  {
    path: '/swap/:assetIn?/:assetOut?',
    redirect: to => {
      return `/trade${to.path.split('/swap')[1]}`;
    }
  },
  { path: '/pool/:id', name: 'pool', component: Pool },
  { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
