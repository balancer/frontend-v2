import { computed, ref } from 'vue';

import config from '@/lib/config';
import { configService } from '@/services/config/config.service';
import { Network } from '@balancer-labs/sdk';

/**
 * STATE
 */
const windowAvailable = typeof window !== 'undefined';
const localStorageNetworkId: Network | undefined =
  windowAvailable && localStorage.getItem('networkId')
    ? (Number(localStorage.getItem('networkId')) as Network)
    : undefined;
const routeSlug =
  (windowAvailable && window.location.hash.split(/[/?]/)[1]) ?? '';
const urlNetworkId: Network | undefined = routeSlug
  ? networkFromSlug(routeSlug)
  : undefined;

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

export function setNetworkId(id: Network) {
  networkId.value = id;
}

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

export function networkFromSlug(networkSlug: string): Network {
  return Number(
    Object.keys(config).find(network => config[network].slug === networkSlug) ??
      '1'
  ) as Network;
}

export function subdomainFor(network: Network): string {
  switch (network) {
    case Network.MAINNET:
      return 'app';
    case Network.KOVAN:
      return 'kovan';
    case Network.GOERLI:
      return 'goerli';
    case Network.POLYGON:
      return 'polygon';
    case Network.ARBITRUM:
      return 'arbitrum';
    case Network.OPTIMISM:
      return 'optimism';
    default:
      throw new Error('Network not supported');
  }
}

export function urlFor(network: Network): string {
  const subdomain = subdomainFor(network);
  const host = configService.env.APP_HOST;
  return `https://${subdomain}.${host}/#`;
}

export default function useNetwork() {
  return {
    networkId,
    networkConfig,
    networkSlug,
    setNetworkId,
  };
}
