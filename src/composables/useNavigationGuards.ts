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

/**
 * Get top level domain excluding 'beta' or 'staging'
 *
 * @param {string} url - Host url - e.g. "polygon.balancer.fi/".
 * @returns {string} Subdomain.
 */
export function getTopLevelDomain(url: string) {
  const betaEnv =
    url.split('.')[0] === 'beta' || url.split('.')[0] === 'staging';
  return betaEnv ? url.split('.')[1] : url.split('.')[0];
}

/**
 * Given domain network return a new format url to redirect to.
 *
 * @param {string} hostUrl - Host url - e.g. "polygon.balancer.fi/pool/create".
 * @param {string} fullPath - Full path of the url - e.g. "/polygon/pool/create".
 * @param {string?} networkSlug - Network name from the url.
 * @returns {string} URL to redirect to.
 */
export function getSubdomainNetworkRedirectUrl(
  hostUrl: string,
  fullPath: string,
  networkSlug?: string
) {
  const subdomain = getTopLevelDomain(hostUrl);
  const subdomainNetwork = networkFromSlug(subdomain);
  if (subdomainNetwork) {
    const networkFromUrl = networkFromSlug(networkSlug ?? '');
    localStorage.setItem(
      'networkId',
      (networkFromUrl || subdomainNetwork).toString()
    );
    return `${appUrl()}${
      networkFromUrl ? '' : '/' + config[subdomainNetwork].slug
    }${fullPath}`;
  } else {
    return undefined;
  }
}

/**
 * Using networkSlug in url check if redirect is necessary
 *
 * @param {string} networkSlug - Network name in url - e.g. "app.balancer.fi/polygon".
 * @param {any} noNetworkChangeCallback - Function which gets triggered if user is on correct network already.
 * @param {any} networkChangeCallback - Function which gets triggered if network change is required.
 */
export function handleNetworkUrl(
  networkSlug: string,
  noNetworkChangeCallback: () => void,
  networkChangeCallback: (networkFromUrl?: Network) => void
) {
  const networkFromUrl = networkFromSlug(networkSlug);
  const localStorageNetwork: Network = networkFor(
    localStorage.getItem('networkId') ?? '1'
  );
  if (!networkFromUrl) {
    // missing or incorrect network name -> next() withtout network change
    return noNetworkChangeCallback();
  } else if (localStorageNetwork === networkFromUrl) {
    // if on the correct network -> next()
    return noNetworkChangeCallback();
  } else {
    // if on different network -> update localstorage and reload
    return networkChangeCallback(networkFromUrl);
  }
}

export default function useNavigationGuards() {
  const router = useRouter();
  const { setShowRedirectModal, isVeBalSupported } = useVeBal();
  const { setSidebarOpen } = useSidebar();

  router.beforeEach((to, from, next) => {
    const subdomainNetworkRedirectUrl = getSubdomainNetworkRedirectUrl(
      window.location.host,
      to.fullPath,
      to.params.networkSlug?.toString()
    );
    if (subdomainNetworkRedirectUrl) {
      window.location.href = subdomainNetworkRedirectUrl;
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
