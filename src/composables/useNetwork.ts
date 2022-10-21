import { computed, ref } from 'vue';

import config from '@/lib/config';
import { configService } from '@/services/config/config.service';
import { Network } from '@balancer-labs/sdk';

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
  (Number(process.env.VUE_APP_NETWORK) as Network) ||
  Network.MAINNET;
if (windowAvailable) localStorage.setItem('networkId', NETWORK_ID.toString());
export const networkSlug = config[NETWORK_ID].slug;
export const networkConfig = config[NETWORK_ID];

/**
 * COMPUTED
 */

export const networkId = ref<Network>(NETWORK_ID);

export const isMainnet = computed(() => networkId.value === Network.MAINNET);
export const isPolygon = computed(() => networkId.value === Network.POLYGON);
export const isArbitrum = computed(() => networkId.value === Network.ARBITRUM);
export const isKovan = computed(() => networkId.value === Network.KOVAN);
export const isGoerli = computed(() => networkId.value === Network.GOERLI);

export const isL2 = computed(() => isPolygon.value || isArbitrum.value);
export const isTestnet = computed(() => isKovan.value || isGoerli.value);

/**
 * METHODS
 */

export function networkFor(key: string | number): Network {
  switch (key.toString()) {
    case '1':
      return Network.MAINNET;
    case '5':
      return Network.GOERLI;
    case '42':
      return Network.KOVAN;
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
  return networkChangeCallback(networkFromUrl);
}

export default function useNetwork() {
  return {
    appUrl,
    networkId,
    networkConfig,
    networkSlug,
    getSubdomain,
    handleNetworkUrl,
  };
}
