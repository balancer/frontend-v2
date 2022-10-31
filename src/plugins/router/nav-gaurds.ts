import {
  getRedirectUrlFor,
  handleNetworkSlug,
  networkFromSlug,
  networkId,
} from '@/composables/useNetwork';
import { Router } from 'vue-router';

/**
 * Navigation gaurds
 */
export function applyNavGaurds(router: Router): Router {
  router = applyNetworkSubdomainRedirect(router);
  router = applyNetworkPathRedirects(router);

  return router;
}

/**
 * Full page refresh redirect to given URL.
 *
 * @param {string} url - URL to redirect to.
 * @param {Router} router - vue-router.
 */
function hardRedirectTo(url: string, router: Router) {
  document.write('');
  window.location.href = url;
  router.go(0);
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
      to.fullPath,
      to.params
    );

    if (redirectUrl) hardRedirectTo(redirectUrl, router);

    next();
  });

  return router;
}

/**
 * Network url redirects - e.g. "app.balancer.fi/#/arbitrum".
 */
function applyNetworkPathRedirects(router: Router): Router {
  router.beforeEach((to, from, next) => {
    const networkSlug = to.params.networkSlug?.toString() ?? '';
    const networkFromPath = networkFromSlug(networkSlug);

    if (networkFromPath) {
      const noNetworkChangeCallback = () => next();
      const networkChangeCallback = () => {
        // I don't think local storage item should be set here. It should be set
        // on app load.
        // localStorage.setItem('networkId', urlNetwork.toString());
        hardRedirectTo(`/#${to.fullPath}`, router);
      };

      handleNetworkSlug(
        networkSlug,
        noNetworkChangeCallback,
        networkChangeCallback
      );
    } else {
      const nonNetworkedRoutes = [
        '/',
        '/terms-of-use',
        '/privacy-policy',
        '/cookies-policy',
      ];
      if (to.redirectedFrom || !nonNetworkedRoutes.includes(to.fullPath)) {
        localStorage.setItem('networkId', networkId.value.toString());
        router.push({
          path: `/${networkSlug}${to.redirectedFrom?.fullPath ?? to.fullPath}`,
        });
      } else {
        next();
      }
    }
  });

  return router;
}
