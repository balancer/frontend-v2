import { networkMap } from '@/services/web3/web3.plugin';
import { Network } from '@balancer-labs/sdk';
import { Wallet } from '@/services/web3/web3.plugin';

function getNetworkIconName(network: Network) {
  return networkMap[Number(network)].toLowerCase();
}
export function buildNetworkIconURL(network: Network | string): string {
  const networkName =
    typeof network === 'string' ? network : getNetworkIconName(network);

  const result = new URL(
    // https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url
    // Warning: Don't extract this template into a variable or it will stop working in production builds
    `/src/assets/images/icons/networks/${networkName}.svg`,
    import.meta.url
  ).href;
  return result;
}

export function buildServiceIconURL(service: string): string {
  return new URL(
    // https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url
    // Warning: Don't extract this template into a variable or it will stop working in production builds
    `/src/assets/images/services/${service}.svg`,
    import.meta.url
  ).href;
}

export function buildConnectorIconURL(wallet: Wallet): string {
  return new URL(
    // https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url
    // Warning: Don't extract this template into a variable or it will stop working in production builds
    `/src/assets/images/connectors/${wallet}.svg`,
    import.meta.url
  ).href;
}
