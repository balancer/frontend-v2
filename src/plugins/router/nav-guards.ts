import { ref } from 'vue';
import {
  getRedirectUrlFor,
  handleNetworkSlug,
  networkFromSlug,
  networkSlug,
  networkSlugV3,
} from '@/composables/useNetwork';
import { isJoinsDisabled } from '@/composables/usePoolHelpers';
import config from '@/lib/config';
import { Network } from '@/lib/config/types';
import { Router } from 'vue-router';
import metaService from '@/services/meta/meta.service';
import { votingRequest } from '@/components/contextual/pages/vebal/providers/voting.provider';

/**
 * State
 */
const redirecting = ref(false);

/**
 * Navigation guards
 */
export function applyNavGuards(router: Router): Router {
  router = applyNetworkSubdomainRedirect(router);
  router = applyNetworkPathRedirects(router);
  router = applyPoolJoinRedirects(router);
  router = applyMetaData(router);
  router = applyVotingRedirects(router);
  router = applyPoolPageRedirects(router);

  return router;
}

/**
 * Full page refresh redirect to given URL.
 *
 * @param {string} url - URL to redirect to.
 * @param {Router} router - vue-router.
 */
export function hardRedirectTo(url: string) {
  redirecting.value = true;
  document.body.style.display = 'none';
  window.location.href = url;
  location.reload();
}

/**
 * Checks current URL for legacy network as subdomain URL and redirects to
 * app.balancer.fi if required.
 *
 * e.g. https://polygon.balancer.fi -> https://app.balancer.fi/#/polygon
 */
function applyNetworkSubdomainRedirect(router: Router): Router {
  router.beforeEach((to, from, next) => {
    const redirectUrl = getRedirectUrlFor(
      window.location.host,
      to.redirectedFrom?.fullPath ?? to.fullPath,
      to.params
    );

    if (redirectUrl) window.location.href = redirectUrl;
    else next();
  });

  return router;
}

/**
 * Assuming the domain is correct, e.g. applyNetworkSubdomainRedirect() has not
 * triggered a redirect, check if the URL path is using the old format and
 * redirect if required.
 *
 * Requirements for a redirect:
 * - If the network is in the path, does it match the current app state? If not
 *   we should redirect to sync path with app state.
 * - If the current route is a redirect and the the path is one that requires a
 *   network slug, update the route to include the network slug.
 *
 * Note: We can assume the domain is correct because applyNetworkSubdomainRedirect() is
 * run before this function, see applyNavGuards().
 */
function applyNetworkPathRedirects(router: Router): Router {
  router.beforeEach((to, from, next) => {
    if (redirecting.value) {
      next();
    } else {
      const networkSlugFromUrl = to.params.networkSlug?.toString() ?? '';
      const networkFromPath = networkFromSlug(networkSlugFromUrl);

      if (networkFromPath) {
        const noNetworkChangeCallback = () => next();
        const networkChangeCallback = () => {
          hardRedirectTo(`/#${to.fullPath}`);
        };

        handleNetworkSlug(
          networkSlugFromUrl,
          noNetworkChangeCallback,
          networkChangeCallback
        );
      } else {
        const networkAgnosticRoutes = [
          '/',
          '/terms-of-use',
          '/privacy-policy',
          '/cookies-policy',
          '/risks',
        ];
        const routerHandledRedirects = ['not-found', 'trade-redirect'];
        if (
          to.redirectedFrom?.fullPath &&
          to.redirectedFrom?.fullPath.includes('/pool')
        ) {
          const newPath = to.redirectedFrom?.fullPath ?? to.fullPath;
          router.push({ path: `/${config[Network.MAINNET].slug}${newPath}` });
        } else if (
          !to.redirectedFrom ||
          routerHandledRedirects.includes(to.redirectedFrom?.name as string) ||
          networkAgnosticRoutes.includes(to.fullPath)
        ) {
          next();
        } else {
          const newPath = to.redirectedFrom?.fullPath ?? to.fullPath;
          const newNetwork = newPath.includes('/pool')
            ? config[Network.MAINNET].slug
            : networkSlug;
          router.push({ path: `/${newNetwork}${newPath}` });
        }
      }
    }
  });

  return router;
}

/**
 * If the route is a pool invest page check if this should be accessible against
 * our isJoinsDisabled conditional. If so, redirect to the pool page.
 */
function applyPoolJoinRedirects(router: Router): Router {
  router.beforeEach((to, from, next) => {
    if (
      to.name === 'add-liquidity' &&
      isJoinsDisabled(to.params?.id as string)
    ) {
      next({
        name: 'pool',
        params: to.params,
      });
    } else next();
  });
  return router;
}

function applyMetaData(router: Router): Router {
  router.beforeEach((to, from, next) => {
    // Pool meta data is handled in the pool page
    if (to.name === 'pool') {
      next();
      return;
    }
    metaService.setMeta(to);
    next();
  });
  return router;
}

/**
 * Redirect to the voting list when trying to open voting page without pools selected for voting.
 */
function applyVotingRedirects(router: Router): Router {
  router.beforeEach((to, from, next) => {
    if (
      to.name === 'vebal-voting' &&
      Object.keys(votingRequest.value).length === 0
    ) {
      next({
        name: 'vebal',
        params: { networkSlug: 'ethereum' },
      });
    } else next();
  });
  return router;
}

/**
 * Redirect to the pool page if the route is a pool page redirect.
 */
function applyPoolPageRedirects(router: Router): Router {
  router.beforeEach((to, from, next) => {
    if (to.name === 'pool') {
      window.location.href = `https://balancer.fi/pools/${networkSlugV3}/v2/${to.params.id}`;
    } else next();
  });
  return router;
}
