import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import HomePage from '@/pages/index.vue';
import PoolPage from '@/pages/pool/_id.vue';
import PoolInvestPage from '@/pages/pool/invest.vue';
import PoolWithdrawPage from '@/pages/pool/withdraw.vue';
import LiquidityMiningPage from '@/pages/liquidity-mining.vue';
import TradePage from '@/pages/trade.vue';
import CreatePoolPage from '@/pages/pool/create.vue';
import MigratePoolPage from '@/pages/pool/migrate.vue';
import TermsOfUsePage from '@/pages/terms-of-use.vue';
import PrivacyPolicyPage from '@/pages/privacy-policy.vue';
import CookiesPolicyPage from '@/pages/cookies-policy.vue';

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
    path: '/pool/create',
    name: 'create-pool',
    component: CreatePoolPage,
    meta: { layout: 'FocusedLayout' }
  },
  {
    path: '/pool/:id',
    name: 'pool',
    component: PoolPage
  },
  {
    path: '/pool/:id/invest',
    name: 'invest',
    component: PoolInvestPage,
    meta: { layout: 'PoolTransferLayout' }
  },
  {
    path: '/pool/:id/withdraw',
    name: 'withdraw',
    component: PoolWithdrawPage,
    meta: { layout: 'PoolTransferLayout' }
  },
  {
    path: '/pool/migrate/:from/:to',
    name: 'migrate-pool',
    component: MigratePoolPage,
    meta: { layout: 'FocusedLayout' }
  },
  {
    path: '/liquidity-mining',
    name: 'liquidity-mining',
    component: LiquidityMiningPage
  },
  {
    path: '/terms-of-use',
    name: 'terms-of-use',
    component: TermsOfUsePage,
    meta: { layout: 'ContentLayout' }
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: PrivacyPolicyPage,
    meta: { layout: 'ContentLayout' }
  },
  {
    path: '/cookies-policy',
    name: 'cookies-policy',
    component: CookiesPolicyPage,
    meta: { layout: 'ContentLayout' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
];

/**
 * DEV/STAGING ONLY ROUTES
 */
if (
  ['development', 'staging'].includes(process.env.VUE_APP_ENV || 'development')
) {
  // routes.push();
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
