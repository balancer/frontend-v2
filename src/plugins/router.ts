import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import HomePage from '@/pages/index.vue';
import PoolPage from '@/pages/pool/_id.vue';
import PoolInvestPage from '@/pages/pool/invest.vue';
import LiquidityMiningPage from '@/pages/liquidity-mining.vue';
import TradePage from '@/pages/trade.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/trade/:assetIn?/:assetOut?',
    name: 'trade',
    component: TradePage
  },
  {
    path: '/swap/:assetIn?/:assetOut?',
    redirect: to => {
      return `/trade${to.path.split('/swap')[1]}`;
    }
  },
  {
    path: '/pool/:id',
    name: 'pool',
    component: PoolPage
  },
  {
    path: '/liquidity-mining',
    name: 'liquidity-mining',
    component: LiquidityMiningPage
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
];

// Temp solution to limit new invest flow to staging and dev apps.
if (
  ['development', 'staging'].includes(process.env.VUE_APP_ENV || 'development')
) {
  routes.push({
    path: '/pool/:id/invest',
    name: 'poolInvest',
    component: PoolInvestPage,
    meta: { layout: 'BlankLayout' }
  });
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
