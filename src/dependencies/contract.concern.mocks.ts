/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  // eslint-disable-next-line no-restricted-imports
  ContractConcern,
  SendTransactionOpts,
} from '@/services/web3/transactions/concerns/contract.concern';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { mock } from 'vitest-mock-extended';
import { initContractConcern } from './contract.concern';

export const defaultCallStaticResponse = {
  nativeFee: BigNumber.from(1),
};

export const defaultContractTransactionHash =
  '0x0679d36034a11eb150a807e9aa648ed79ecdcf7f3fe5ec3cbad9123e67b02c96';
export const defaultContractTransactionResponse = mock<TransactionResponse>();
defaultContractTransactionResponse.chainId = 5;
defaultContractTransactionResponse.hash = defaultContractTransactionHash;

export const sendTransactionMock = vi.fn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (opts: SendTransactionOpts) =>
    Promise.resolve(defaultContractTransactionResponse)
);

export const callStaticMock = vi.fn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (opts: SendTransactionOpts) => Promise.resolve(defaultCallStaticResponse)
);

export class MockedContractConcern extends ContractConcern {
  callStatic = <T>(opts: SendTransactionOpts): Promise<T> =>
    //@ts-ignore
    callStaticMock(opts);
  sendTransaction = (opts: SendTransactionOpts) => sendTransactionMock(opts);
}

export function initContractConcernWithDefaultMocks() {
  initContractConcern(MockedContractConcern);
}
