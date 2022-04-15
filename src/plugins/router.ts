import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

import { isL2 } from '@/composables/useNetwork';
const ClaimPage = () => import('@/pages/claim.vue');
const CookiesPolicyPage = () => import('@/pages/cookies-policy.vue');
const GetVeBalPage = () => import('@/pages/get-vebal.vue');
const HomePage = () => import('@/pages/index.vue');
const LiquidityMiningPage = () => import('@/pages/liquidity-mining.vue');
const PoolPage = () => import('@/pages/pool/_id.vue');
const CreatePoolPage = () => import('@/pages/pool/create.vue');
const PoolInvestPage = () => import('@/pages/pool/invest.vue');
const PoolWithdrawPage = () => import('@/pages/pool/withdraw.vue');
const PrivacyPolicyPage = () => import('@/pages/privacy-policy.vue');
const TermsOfUsePage = () => import('@/pages/terms-of-use.vue');
const TradePage = () => import('@/pages/trade.vue');
const UnlockVeBalPage = () => import('@/pages/unlock-vebal.vue');
const VeBalPage = () => import('@/pages/vebal.vue');

declare module 'vue-router' {
  interface RouteMeta {
    layout?: string;
    bgColors?: {
      dark: string;
      light: string;
    };
  }
}

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
    path: '/pool/create/:tx?',
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
  },
  {
    path: '/vebal',
    name: 'vebal',
    component: VeBalPage
  },
  {
    path: '/get-vebal',
    name: 'get-vebal',
    component: GetVeBalPage,
    meta: { layout: 'FocusedLayout' }
  },
  {
    path: '/unlock',
    name: 'unlock',
    component: UnlockVeBalPage,
    meta: { layout: 'FocusedLayout' }
  },
  {
    path: '/claim',
    name: 'claim',
    component: ClaimPage
  }
];

/**
 * DEV/STAGING ONLY ROUTES
 */
// if (
//   ['development', 'staging'].includes(process.env.VUE_APP_ENV || 'development')
// ) {
//   routes.push();
// }

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
