import { computed, ref } from 'vue';
import { Network } from '@balancer-labs/sdk';

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

/**
 * METHODS
 */
export function setNetworkId(id: Network) {
  networkId.value = id;
}

export default function useNetwork() {
  return {
    setNetworkId,
    networkId
  };
}
