import { ref } from 'vue';

/**
 * TYPES
 */
export enum Network {
  MAINNET = 42220,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  POLYGON = 137,
  ARBITRUM = 42161,
  ETHEREUM 
}

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
