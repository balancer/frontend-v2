// eslint-disable-next-line no-restricted-imports
import { Web3Provider } from '@ethersproject/providers';

import { handleDependencyError } from '..';

let _Web3Provider: typeof Web3Provider | undefined;

/**
 * It uses the real Web3Provider instance by default but allows injecting Web3Provider mocks from tests
 */
export function initWeb3Provider(
  Web3ProviderInstance: typeof Web3Provider = Web3Provider
) {
  _Web3Provider = Web3ProviderInstance;
}

export function getWeb3Provider() {
  if (!_Web3Provider) {
    handleDependencyError('Web3Provider');
  }
  return _Web3Provider;
}

export type WalletProvider = Web3Provider;
