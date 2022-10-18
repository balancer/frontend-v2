import NProgress from 'nprogress';
import { RouteLocationNormalized, useRouter } from 'vue-router';

import { Network } from '@balancer-labs/sdk';
import config from '@/lib/config';

import { useSidebar } from './useSidebar';
import useVeBal from './useVeBAL';
import { networkFor, networkFromSlug, appUrl } from '@/composables/useNetwork';

// Progress bar config
NProgress.configure({ showSpinner: false });
let delayedStartProgressBar;

// Handle different url formats
function getSubdomain() {
  const betaEnv =
    window.location.host.split('.')[0] === 'beta' ||
    window.location.host.split('.')[0] === 'staging';
  return betaEnv
    ? window.location.host.split('.')[1]
    : window.location.host.split('.')[0];
}

// old format subdomain redirect - e.g. "https://polygon.balancer.fi/"
// if conflicting formats - use the url - e.g. "https://polygon.balancer.fi/#/arbitrum" -> arbitrum
function redirectOldFormatUrl(
  networkFromSubdomain: Network,
  networkSlug: string | undefined,
  to: RouteLocationNormalized
) {
  const networkFromUrl = networkFromSlug(networkSlug ?? '');
  localStorage.setItem(
    'networkId',
    (networkFromUrl || networkFromSubdomain).toString()
  );
  window.location.href = networkFromUrl
    ? `${appUrl()}${to.fullPath}`
    : `${appUrl()}/${config[networkFromUrl || networkFromSubdomain].slug}${
        to.fullPath
      }`;
}

// check for network in url and redirect if necessary
function handleNetworkUrl(
  networkSlug: string,
  noNetworkChangeCallback,
  networkChangeCallback
) {
  const networkFromUrl = networkFromSlug(networkSlug);
  const localStorageNetwork: Network = networkFor(
    localStorage.getItem('networkId') ?? '1'
  );
  if (!networkFromUrl) {
    // missing or incorrect network name -> next() withtout network change
    noNetworkChangeCallback();
  } else if (localStorageNetwork === networkFromUrl) {
    // if on the correct network -> next()
    noNetworkChangeCallback();
  } else {
    // if on different network -> update localstorage and reload
    networkChangeCallback(networkFromUrl);
  }
}

export default function useNavigationGuards() {
  const router = useRouter();
  const { setShowRedirectModal, isVeBalSupported } = useVeBal();
  const { setSidebarOpen } = useSidebar();

  router.beforeEach((to, from, next) => {
    const subdomain = getSubdomain();
    const networkFromSubdomain = networkFromSlug(subdomain);
    const networkSlug = to.params.networkSlug?.toString();
    if (networkFromSubdomain) {
      redirectOldFormatUrl(networkFromSubdomain, networkSlug, to);
    } else {
      if (networkSlug) {
        const noNetworkChangeCallback = () => {
          next();
        };
        const networkChangeCallback = (networkFromUrl: Network) => {
          document.write('');
          localStorage.setItem('networkId', networkFromUrl.toString());
          window.location.href = `/#${to.fullPath}`;
          router.go(0);
        };
        handleNetworkUrl(
          networkSlug,
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
