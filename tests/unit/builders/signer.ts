import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcSigner, TransactionResponse } from '@ethersproject/providers';
import { mock, mockDeep } from 'vitest-mock-extended';
import { randomAddress } from './address';

export const defaultTransactionResponse = mockDeep<TransactionResponse>();

export const defaultGasLimit = 2;
const defaultEstimatedGas = BigNumber.from(defaultGasLimit);

export function aSigner(...options: Partial<JsonRpcSigner>[]): JsonRpcSigner {
  const defaultSigner = mock<JsonRpcSigner>();
  defaultSigner.getAddress.mockResolvedValue(randomAddress());
  defaultSigner.getChainId.mockResolvedValue(5);
  // @ts-ignore
  defaultSigner.provider = { getBlockNumber: () => 25 };

  defaultSigner.sendTransaction.mockResolvedValue(defaultTransactionResponse);

  defaultSigner.estimateGas.mockResolvedValue(defaultEstimatedGas);

  defaultSigner.getGasPrice.mockResolvedValue(defaultEstimatedGas);

  return Object.assign(defaultSigner, ...options);
}
