export const DefaultLayout = defineAsyncComponent(
  () => import('@/pages/_layouts/DefaultLayout.vue')
);

export const AppNav = defineAsyncComponent(
  () => import('@/components/navs/AppNav/AppNav.vue')
);
export const Footer = defineAsyncComponent(
  () => import('@/components/footer/Footer.vue')
);
export const FocussedLayout = defineAsyncComponent(
  () => import('@/components/layouts/FocussedLayout.vue')
);

export const layoutProviders = defineAsyncComponent(
  () => import('./layout.providers')
);
