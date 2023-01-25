import { computed, ref } from 'vue';

import config from '@/lib/config';
import { configService } from '@/services/config/config.service';
import { Network } from '@balancer-labs/sdk';
import { RouteParamsRaw } from 'vue-router';

/**
 * STATE
 */
const windowAvailable = typeof window !== 'undefined';
const localStorageNetworkId: Network | null =
  windowAvailable && localStorage.getItem('networkId')
    ? (Number(localStorage.getItem('networkId')) as Network)
    : null;
const routeSlug =
  (windowAvailable && window.location.hash.split(/[/?]/)[1]) ?? '';
const urlNetworkId: Network | null = routeSlug
  ? networkFromSlug(routeSlug)
  : null;

const NETWORK_ID =
  urlNetworkId ||
  localStorageNetworkId ||
  (Number(import.meta.env.VITE_NETWORK) as Network) ||
  Network.MAINNET;
if (windowAvailable) localStorage.setItem('networkId', NETWORK_ID.toString());
export const networkSlug = config[NETWORK_ID].slug;
export const networkConfig = config[NETWORK_ID];
export const networkLabelMap = {
  [Network.MAINNET]: 'Ethereum',
  [Network.POLYGON]: 'Polygon',
  [Network.ARBITRUM]: 'Arbitrum',
  [Network.GOERLI]: 'Goerli',
  [Network.OPTIMISM]: 'Optimism',
};

/**
 * COMPUTED
 */

export const networkId = ref<Network>(NETWORK_ID);

export const isMainnet = computed(() => networkId.value === Network.MAINNET);
export const isPolygon = computed(() => networkId.value === Network.POLYGON);
export const isArbitrum = computed(() => networkId.value === Network.ARBITRUM);
export const isGoerli = computed(() => networkId.value === Network.GOERLI);

export const isL2 = computed(() => isPolygon.value || isArbitrum.value);
export const isTestnet = computed(() => isGoerli.value);

/**
 * METHODS
 */

export function networkFor(key: string | number): Network {
  switch (key.toString()) {
    case '1':
      return Network.MAINNET;
    case '5':
      return Network.GOERLI;
    case '137':
      return Network.POLYGON;
    case '42161':
      return Network.ARBITRUM;
    default:
      throw new Error('Network not supported');
  }
}

export function getNetworkSlug(network: Network): string {
  return config[network].slug;
}

export function networkFromSlug(networkSlug: string): Network | null {
  const networkConf = Object.keys(config).find(
    network => config[network].slug === networkSlug
  );
  return networkConf ? (Number(networkConf) as Network) : null;
}

export function appUrl(): string {
  return `https://${configService.env.APP_DOMAIN}/#`;
}

/**
 * Get subdomain, excluding 'beta'
 *
 * @param {string} url - Host url - e.g. "polygon.balancer.fi/".
 * @returns {string} Subdomain.
 */
export function getSubdomain(url: string) {
  const subdomain = url.split('.')[0];
  if (subdomain === 'beta') {
    return url.split('.')[1];
  }
  return subdomain;
}

/**
 * Using networkSlug in url check if redirect is necessary. Redirect is
 * necessary if something about the current state doesn't match the networkSlug.
 *
 * @param {string} networkSlug - Network name in url - e.g. "app.balancer.fi/polygon".
 * @param {Function} noNetworkChangeCallback - Function which gets triggered if user is on correct network already.
 * @param {Function} networkChangeCallback - Function which gets triggered if network change is required.
 */
export function handleNetworkSlug(
  networkSlug: string,
  noNetworkChangeCallback: () => void,
  networkChangeCallback: () => void
) {
  const networkFromUrl = networkFromSlug(networkSlug);
  const localStorageNetwork = networkFor(
    localStorage.getItem('networkId') ?? '1'
  );
  if (!networkFromUrl) {
    // missing or incorrect network name -> next() withtout network change
    return noNetworkChangeCallback();
  }
  if (localStorageNetwork === networkFromUrl) {
    // if on the correct network -> next()
    return noNetworkChangeCallback();
  }

  // if on different network -> update localstorage and reload
  return networkChangeCallback();
}

/**
 * Takes current URL and checks if a redirect URL is required, if not returns undefined.
 *
 * @param {string} host - The current host, e.g. polygon.balancer.fi
 * @param {string} fullPath - The current full path from vue router.
 * @param {RouteParamsRaw} params - The params in the current route.
 * @returns {string|undefined} The URL to redirect to, e.g. https://app.balancer.fi/#/polygon
 */
export function getRedirectUrlFor(
  host: string,
  fullPath: string,
  params: RouteParamsRaw = {}
): string | undefined {
  const subdomain = getSubdomain(host);
  const subdomainNetwork = networkFromSlug(subdomain);

  if (subdomainNetwork) {
    // Legacy network subdomain, we need to redirect to app.balancer.fi.
    const newDomain = appUrl().replace(subdomain, 'app');
    // If networkSlug provided it will be in the fullPath, so pass empty string instead.
    const newNetwork = params?.networkSlug
      ? ''
      : `/${getNetworkSlug(subdomainNetwork)}`;
    return `${newDomain}${newNetwork}${fullPath}`;
  }

  return;
}

export default function useNetwork() {
  return {
    appUrl,
    networkId,
    networkConfig,
    networkSlug,
    getNetworkSlug,
    getSubdomain,
    handleNetworkSlug,
    networkLabelMap,
  };
}
