import { Network } from '@balancer-labs/sdk';
import { Wallet } from '@/services/web3/web3.plugin';

export function buildNetworkIconURL(networkId: Network | string): string {
  return new URL(
    // https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url
    // Warning: Don't extract this template into a variable or it will stop working in production builds
    `/src/assets/images/icons/networks/${networkId}.svg`,
    import.meta.url
  ).href;
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
