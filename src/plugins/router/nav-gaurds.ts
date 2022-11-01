import {
  getRedirectUrlFor,
  handleNetworkSlug,
  networkFromSlug,
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
    const networkSlug = to.params.networkSlug?.toString() ?? '';
    const networkFromPath = networkFromSlug(networkSlug);

    if (networkFromPath) {
      const noNetworkChangeCallback = () => next();
      const networkChangeCallback = () => {
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
        const newPath = to.redirectedFrom?.fullPath ?? to.fullPath;
        router.push({ path: `/${networkSlug}${newPath}` });
      } else {
        next();
      }
    }
  });

  return router;
}
