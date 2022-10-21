import NProgress from 'nprogress';
import { useRouter } from 'vue-router';

import { Network } from '@balancer-labs/sdk';

import { useSidebar } from './useSidebar';
import useVeBal from './useVeBAL';
import {
  networkFromSlug,
  getSubdomain,
  handleNetworkUrl,
  networkId,
  networkSlug,
} from '@/composables/useNetwork';

// Progress bar config
NProgress.configure({ showSpinner: false });
let delayedStartProgressBar;

export default function useNavigationGuards() {
  const router = useRouter();
  const { setShowRedirectModal, isVeBalSupported } = useVeBal();
  const { setSidebarOpen } = useSidebar();

  /**
   * Subdomain redirects - e.g. "polygon.balancer.fi/".
   */
  router.beforeEach((to, from, next) => {
    const subdomain = getSubdomain(window.location.host);
    const subdomainNetwork = networkFromSlug(subdomain);
    if (subdomainNetwork) {
      document.write('');
      localStorage.setItem('networkId', subdomainNetwork.toString());
      window.location.href = `/#${to.params.networkSlug ? '' : networkSlug}${
        to.fullPath
      }`;
      router.go(0);
    }
    next();
  });

  /**
   * Network url redirects - e.g. "app.balancer.fi/#/arbitrum".
   */
  router.beforeEach((to, from, next) => {
    const urlNetwork = networkFromSlug(to.params.networkSlug?.toString() ?? '');
    if (urlNetwork) {
      const noNetworkChangeCallback = () => next();
      const networkChangeCallback = (urlNetwork?: Network) => {
        document.write('');
        localStorage.setItem('networkId', (urlNetwork ?? '').toString());
        window.location.href = `/#${to.fullPath}`;
        router.go(0);
      };
      handleNetworkUrl(
        to.params.networkSlug.toString(),
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

  router.beforeEach((to, from, next) => {
    if (to.name == 'vebal') {
      if (isVeBalSupported.value) next();
      else {
        setSidebarOpen(false);
        setShowRedirectModal(true);
        return false;
      }
    } else {
      next();
    }
  });

  router.beforeEach(() => {
    // Delay start of progress bar so only the users with slow connections can see it
    delayedStartProgressBar = setTimeout(() => {
      NProgress.start();
    }, 1000);
  });
  router.afterEach(() => {
    // Clear progress bar timeout, so it doesn't start after page load
    clearTimeout(delayedStartProgressBar);

    // Complete the animation of the route progress bar.
    NProgress.done();
  });
  router.onError(() => {
    NProgress.done();
  });
}
