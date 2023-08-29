import { Network } from '@/lib/config/types';

import { MetamaskConnectorMock } from '@/dependencies/wallets/wallet-connector-mocks';
import { JsonRpcSigner, TransactionResponse } from '@ethersproject/providers';
import { mock, mockDeep } from 'vitest-mock-extended';
import { WalletProvider } from '@/dependencies/wallets/Web3Provider';

export const walletSignerMock = mockDeep<JsonRpcSigner>();
export const blockNumber = 16741022;
export const defaultUserAddress = '0xddd0c9C1b6C8537BeD0487C3fd64CF6140bd4ddd';
export const vaultAddress = '0xba100000625a3754423978a60c9317c58a424e3D';

export const defaultWalletTransactionResponse = mock<TransactionResponse>();

walletSignerMock.provider.getBlockNumber.mockImplementation(() =>
  Promise.resolve(blockNumber)
);
walletSignerMock.getChainId.mockImplementation(async () => Network.GOERLI);
walletSignerMock.getAddress.mockImplementation(async () => defaultUserAddress);

walletSignerMock.sendTransaction.mockResolvedValue(
  defaultWalletTransactionResponse
);

export const walletProviderMock = new MetamaskConnectorMock(
  'fake account'
) as unknown as WalletProvider;
walletProviderMock.getSigner = () => walletSignerMock;
