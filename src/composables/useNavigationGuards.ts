import NProgress from 'nprogress';
import { useRouter } from 'vue-router';

import { Network } from '@balancer-labs/sdk';
import config from '@/lib/config';

import { useSidebar } from './useSidebar';
import useVeBal from './useVeBAL';
import { networkFor, networkFromSlug, appUrl } from '@/composables/useNetwork';

// Progress bar config
NProgress.configure({ showSpinner: false });
let delayedStartProgressBar;

export default function useNavigationGuards() {
  const router = useRouter();
  const { setShowRedirectModal, isVeBalSupported } = useVeBal();
  const { setSidebarOpen } = useSidebar();

  router.beforeEach((to, from, next) => {
    const networkSlug = to.params.networkSlug?.toString();
    if (networkSlug) {
      const networkFromSubdomain = networkFromSlug(
        window.location.host.split('.')[0]
      );
      const networkFromUrl = networkFromSlug(networkSlug);
      if (networkFromSubdomain) {
        // old format subdomain redirect
        document.write('');
        localStorage.setItem(
          'networkId',
          (networkFromUrl || networkFromSubdomain).toString()
        );
        window.location.href = `${appUrl()}/#$${
          config[networkFromUrl || networkFromSubdomain].slug
        }/${to.fullPath}`;
        router.go(0);
      }
      const localStorageNetwork: Network = networkFor(
        localStorage.getItem('networkId') ?? '1'
      );
      if (!networkFromUrl) {
        // missing or incorrect network name -> next() withtout network change
        next();
      } else if (localStorageNetwork === networkFromUrl) {
        // if on the correct network -> next()
        next();
      } else {
        // if on different network -> update localstorage and reload
        document.write('');
        localStorage.setItem('networkId', networkFromUrl.toString());
        window.location.href = `/#${to.fullPath}`;
        router.go(0);
      }
    } else {
      next();
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
