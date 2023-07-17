import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcSigner, TransactionResponse } from '@ethersproject/providers';
import { mock } from 'vitest-mock-extended';
import { randomAddress } from './address';

export const defaultTransactionResponse = mock<TransactionResponse>();
defaultTransactionResponse.to = 'default to';
defaultTransactionResponse.from = 'default from';
defaultTransactionResponse.data = 'default data';

export const defaultGasLimit = 2;
const defaultEstimatedGas = BigNumber.from(defaultGasLimit);
export const defaultTxValue = BigNumber.from(0);

export function aSigner(...options: Partial<JsonRpcSigner>[]): JsonRpcSigner {
  const defaultSigner = mock<JsonRpcSigner>();
  defaultSigner.getAddress.mockResolvedValue(randomAddress());
  defaultSigner.getChainId.mockResolvedValue(5);
  // @ts-ignore
  defaultSigner.provider = { getBlockNumber: () => 25 };

  defaultSigner.sendTransaction.mockResolvedValue(defaultTransactionResponse);

  defaultSigner.estimateGas.mockResolvedValue(defaultEstimatedGas);

  defaultSigner.getGasPrice.mockResolvedValue(defaultEstimatedGas);

  return Object.assign({}, defaultSigner, ...options);
}
