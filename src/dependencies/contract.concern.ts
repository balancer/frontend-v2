// eslint-disable-next-line no-restricted-imports
import { ContractConcern } from '@/services/web3/transactions/concerns/contract.concern';
import { handleDependencyError } from '.';

let contractConcern: typeof ContractConcern | undefined;

/**
 * initContractConcern uses the real Contract Concern instance by default but allows injecting Contract Concern mocks from tests
 */
export function initContractConcern(
  contractConcernInstance: typeof ContractConcern = ContractConcern
) {
  contractConcern = contractConcernInstance;
}

export function getContractConcern() {
  if (!contractConcern) {
    handleDependencyError('Contract Concern');
  }
  return contractConcern;
}

export type ContractConcernType = ContractConcern;
