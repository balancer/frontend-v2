import { ref } from 'vue';
import { Network } from '@balancer-labs/sdk';

/**
 * STATE
 */
const DEFAULT_NETWORK_ID =
  process.env.VUE_APP_NETWORK != null
    ? (Number(process.env.VUE_APP_NETWORK) as Network)
    : Network.MAINNET;

export const networkId = ref<Network>(DEFAULT_NETWORK_ID);

export const isMainnet = networkId.value === Network.MAINNET;
export const isPolygon = networkId.value === Network.POLYGON;
export const isArbitrum = networkId.value === Network.ARBITRUM;

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
