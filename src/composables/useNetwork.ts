import { ref } from 'vue';

export type NetworkId = 1 | 3 | 4 | 5 | 42 | 137 | 42161;

export enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  POLYGON = 137,
  ARBITRUM = 42161
}

const DEFAULT_NETWORK_ID =
  process.env.VUE_APP_NETWORK != null
    ? (Number(process.env.VUE_APP_NETWORK) as NetworkId)
    : Network.MAINNET;

export const networkId = ref<NetworkId>(DEFAULT_NETWORK_ID);

export function setNetworkId(id: NetworkId) {
  networkId.value = id;
}

export default function useNetwork() {
  return {
    setNetworkId,
    networkId
  };
}
