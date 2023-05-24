import {
  // eslint-disable-next-line no-restricted-imports
  ContractConcern,
  SendTransactionOpts,
} from '@/services/web3/transactions/concerns/contract.concern';
import { initContractConcern } from './contract.concern';
import { aSigner } from '@tests/unit/builders/signer';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { mock } from 'vitest-mock-extended';

export const defaultContractTransactionResponse = mock<TransactionResponse>();
defaultContractTransactionResponse.chainId = 5;

export const sendTransactionMock = vi.fn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (opts: SendTransactionOpts) =>
    Promise.resolve(defaultContractTransactionResponse)
);

export class MockedContractConcern extends ContractConcern {
  constructor() {
    super(aSigner());
  }

  sendTransaction = (opts: SendTransactionOpts) => sendTransactionMock(opts);
}

export function initContractConcernWithDefaultMocks() {
  initContractConcern(MockedContractConcern);
}
