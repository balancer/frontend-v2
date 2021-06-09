import { compact } from 'lodash';

import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/pages/Home.vue';
import Pool from '@/pages/Pool.vue';
import Trade from '@/pages/Trade.vue';
import TradeGP from '@/pages/TradeGP.vue';

const routes: RouteRecordRaw[] = compact([
  { path: '/', name: 'home', component: Home },
  { path: '/trade/:assetIn?/:assetOut?', name: 'trade', component: Trade },
  process.env.VUE_APP_GNOSIS_INTEGRATION === 'true'
    ? {
        path: '/trade-gp/:assetIn?/:assetOut?',
        name: 'trade-gp',
        component: TradeGP
      }
    : undefined,
  {
    path: '/swap/:assetIn?/:assetOut?',
    redirect: to => {
      return `/trade${to.path.split('/swap')[1]}`;
    }
  },
  { path: '/pool/:id', name: 'pool', component: Pool },
  { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' }
]);

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
