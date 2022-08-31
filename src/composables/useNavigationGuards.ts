import NProgress from 'nprogress';
import { useRouter } from 'vue-router';

import { useSidebar } from './useSidebar';
import useVeBal from './useVeBAL';
import { networkFor, networkFromSlug } from '@/composables/useNetwork';
import { Network } from '@balancer-labs/sdk';

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
      const networkFromUrl: Network = networkFromSlug(networkSlug);
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
