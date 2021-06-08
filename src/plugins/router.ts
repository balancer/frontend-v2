import { compact } from 'lodash';

import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/pages/Home.vue';
import Pool from '@/pages/Pool.vue';
import Trade from '@/pages/Trade.vue';
import TradeV2 from '@/pages/TradeV2.vue';

const routes: RouteRecordRaw[] = compact([
  { path: '/', name: 'home', component: Home },
  { path: '/trade/:assetIn?/:assetOut?', name: 'trade', component: Trade },
  process.env.VUE_APP_GNOSIS_INTEGRATION === 'true'
    ? {
        path: '/tradev2/:assetIn?/:assetOut?',
        name: 'tradev2',
        component: TradeV2
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

console.log(routes);

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
