import { Network } from '@balancer-labs/sdk';
import { computed, ref } from 'vue';

import config from '@/lib/config';
import { configService } from '@/services/config/config.service';

/**
 * STATE
 */
const DEFAULT_NETWORK_ID =
  process.env.VUE_APP_NETWORK != null
    ? (Number(process.env.VUE_APP_NETWORK) as Network)
    : Network.MAINNET;

export const networkId = ref<Network>(DEFAULT_NETWORK_ID);

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

export function networkNameFor(network: Network): string {
  return config[network].network;
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
    setNetworkId,
    networkId,
  };
}
