import { Network } from '@balancer-labs/sdk';

import { MetamaskConnectorMock } from '@/dependencies/wallets/wallet-connector-mocks';
import { JsonRpcSigner } from '@ethersproject/providers';
import { mockDeep } from 'vitest-mock-extended';
import { WalletProvider } from '@/dependencies/wallets/Web3Provider';

export const signerMock = mockDeep<JsonRpcSigner>();
export const blockNumber = 16741022;
export const defaultUserAddress = '0xddd0c9C1b6C8537BeD0487C3fd64CF6140bd4ddd';

signerMock.provider.getBlockNumber = () => Promise.resolve(blockNumber);
signerMock.getChainId = () => Promise.resolve(Network.GOERLI);
signerMock.getAddress = () => Promise.resolve(defaultUserAddress);

export const walletProviderMock = new MetamaskConnectorMock(
  'fake account'
) as unknown as WalletProvider;
walletProviderMock.getSigner = () => signerMock;
