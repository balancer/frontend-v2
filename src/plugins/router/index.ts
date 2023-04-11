import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { captureException } from '@sentry/browser';

import { isGoerli } from '@/composables/useNetwork';
import { applyNavGuards } from './nav-guards';

const ClaimPage = () =>
  import(/* webpackChunkName: "ClaimPage" */ '@/pages/claim/index.vue');
const LegacyClaimPage = () =>
  import(/* webpackChunkName: "LegacyClaimPage" */ '@/pages/claim/legacy.vue');
const CookiesPolicyPage = () =>
  import(
    /* webpackChunkName: "CookiesPolicyPage" */ '@/pages/cookies-policy.vue'
  );
const GetVeBalPage = () =>
  import(/* webpackChunkName: "GetVeBalPage" */ '@/pages/get-vebal.vue');
const HomePage = () =>
  import(
    /* webpackChunkName: "HomePage" */ /* webpackPrefetch: true */ '@/pages/index.vue'
  );
const PoolPage = () =>
  import(
    /* webpackChunkName: "PoolPage" */ /* webpackPrefetch: true */ '@/pages/pool/_id.vue'
  );
const CreatePoolPage = () =>
  import(/* webpackChunkName: "CreatePoolPage" */ '@/pages/pool/create.vue');
const PoolAddLiquidityPage = () =>
  import(
    /* webpackChunkName: "PoolAddLiquidityPage" */ '@/pages/pool/add-liquidity.vue'
  );
const MigratePoolPage = () =>
  import(/* webpackChunkName: "MigratePoolPage" */ '@/pages/pool/migrate.vue');
const PoolWithdrawPage = () =>
  import(
    /* webpackChunkName: "PoolWithdrawPage" */ '@/pages/pool/withdraw.vue'
  );
const PrivacyPolicyPage = () =>
  import(
    /* webpackChunkName: "PrivacyPolicyPage" */ '@/pages/privacy-policy.vue'
  );
const TermsOfUsePage = () =>
  import(/* webpackChunkName: "TermsOfUsePage" */ '@/pages/terms-of-use.vue');
const RisksPage = () =>
  import(/* webpackChunkName: "RisksPage" */ '@/pages/risks.vue');
const SwapPage = () =>
  import(
    /* webpackChunkName: "SwapPage" */ /* webpackPrefetch: true */ '@/pages/swap.vue'
  );
const UnlockVeBalPage = () =>
  import(/* webpackChunkName: "UnlockVeBalPage" */ '@/pages/unlock-vebal.vue');
const VeBalPage = () =>
  import(/* webpackChunkName: "VeBalPage" */ '@/pages/vebal.vue');
const FaucetPage = () =>
  import(/* webpackChunkName: "FaucetPage" */ '@/pages/faucet.vue');

const PortfolioPage = () =>
  import(
    /* webpackChunkName: "PortfolioPage" */ /* webpackPrefetch: true */ '@/pages/portfolio.vue'
  );

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
    component: HomePage,
  },
  {
    path: '/terms-of-use',
    name: 'terms-of-use',
    component: TermsOfUsePage,
    meta: { layout: 'ContentLayout' },
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: PrivacyPolicyPage,
    meta: { layout: 'ContentLayout' },
  },
  {
    path: '/cookies-policy',
    name: 'cookies-policy',
    component: CookiesPolicyPage,
    meta: { layout: 'ContentLayout' },
  },
  {
    path: '/risks',
    name: 'risks',
    component: RisksPage,
    meta: { layout: 'ContentLayout' },
  },
  {
    path: '/:networkSlug/swap/:assetIn?/:assetOut?',
    name: 'swap',
    component: SwapPage,
  },
  {
    path: '/:networkSlug/trade/:assetIn?/:assetOut?',
    name: 'trade-redirect',
    redirect: to => {
      return `/${to.params.networkSlug}/swap${to.path.split('/trade')[1]}`;
    },
  },
  {
    path: '/:networkSlug/pool/create/:tx?',
    name: 'create-pool',
    component: CreatePoolPage,
    meta: { layout: 'FocusedLayout' },
  },
  {
    path: '/:networkSlug/pool/:id',
    name: 'pool',
    component: PoolPage,
  },
  {
    path: '/:networkSlug/pool/:id/add-liquidity',
    name: 'add-liquidity',
    component: PoolAddLiquidityPage,
    meta: { layout: 'FocusedLayout' },
  },
  {
    path: '/:networkSlug/pool/:id/invest',
    name: 'invest-redirect',
    redirect: to => {
      return `/${to.params.networkSlug}/pool/${to.params.id}/add-liquidity`;
    },
  },
  {
    path: '/:networkSlug/pool/:id/withdraw',
    name: 'withdraw',
    component: PoolWithdrawPage,
    meta: { layout: 'FocusedLayout' },
  },
  {
    path: '/:networkSlug/pool/migrate/:from/:to',
    name: 'migrate-pool',
    component: MigratePoolPage,
    meta: { layout: 'FocusedLayout' },
  },
  {
    path: '/:networkSlug/vebal',
    name: 'vebal',
    component: VeBalPage,
  },
  {
    path: '/:networkSlug/get-vebal',
    name: 'get-vebal',
    component: GetVeBalPage,
    meta: { layout: 'FocusedLayout' },
  },
  {
    path: '/:networkSlug/unlock',
    name: 'unlock',
    component: UnlockVeBalPage,
    meta: { layout: 'FocusedLayout' },
  },
  {
    path: '/:networkSlug/claim',
    name: 'claim',
    component: ClaimPage,
  },
  {
    path: '/:networkSlug/claim/legacy',
    name: 'legacy-claim',
    component: LegacyClaimPage,
  },
  {
    path: '/:networkSlug/portfolio',
    name: 'portfolio',
    component: PortfolioPage,
  },
  {
    path: '/:networkSlug?',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/',
  },
];

/**
 * TESTNET ONLY ROUTES
 */
if (isGoerli.value) {
  routes.push({
    path: '/:networkSlug/faucet',
    name: 'faucet',
    component: FaucetPage,
  });
}

/**
 * DEV/STAGING ONLY ROUTES
 */
// if (
//   ['development', 'staging'].includes(import.meta.env.VITE_ENV || 'development')
// ) {
//   routes.push();
// }

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash };

    return { x: 0, top: 0 };
  },
});

router.onError((error, to) => {
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    captureException(
      'Triggered automatic reload after failed to fetch dynamically imported module. ',
      {
        extra: error.message,
      }
    );
    window.location.href = to.fullPath;
  }
});

export default applyNavGuards(router);
