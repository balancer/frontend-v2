import NProgress from 'nprogress';
import { useRouter } from 'vue-router';

import { Network } from '@balancer-labs/sdk';

import { useSidebar } from './useSidebar';
import useVeBal from './useVeBAL';
import {
  networkFromSlug,
  getSubdomain,
  getSubdomainNetworkRedirectUrl,
  handleNetworkUrl,
} from '@/composables/useNetwork';

// Progress bar config
NProgress.configure({ showSpinner: false });
let delayedStartProgressBar;

export default function useNavigationGuards() {
  const router = useRouter();
  const { setShowRedirectModal, isVeBalSupported } = useVeBal();
  const { setSidebarOpen } = useSidebar();

  router.beforeEach((to, from, next) => {
    const subdomain = getSubdomain(window.location.host);
    const subdomainNetwork = networkFromSlug(subdomain);
    if (subdomainNetwork) {
      localStorage.setItem('networkId', subdomainNetwork.toString());
      window.location.href =
        getSubdomainNetworkRedirectUrl(window.location.href) ?? '/';
    } else {
      if (to.params.networkSlug) {
        const noNetworkChangeCallback = () => next();
        const networkChangeCallback = (networkFromUrl?: Network) => {
          document.write('');
          localStorage.setItem('networkId', (networkFromUrl ?? '').toString());
          window.location.href = `/#${to.fullPath}`;
          router.go(0);
        };
        handleNetworkUrl(
          to.params.networkSlug.toString(),
          noNetworkChangeCallback,
          networkChangeCallback
        );
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
