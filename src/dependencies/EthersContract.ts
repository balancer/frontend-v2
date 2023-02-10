import { Contract } from '@ethersproject/contracts';
import { handleDependencyError } from '.';

let _contract: typeof Contract | undefined;

/**
 * initContract uses the real Ethers Contract instance by default but allows injecting Contract mocks from tests
 */
export function initEthersContract(
  contractInstance: typeof Contract = Contract
) {
  _contract = contractInstance;
}

export function getEthersContract() {
  if (!_contract) {
    handleDependencyError('Ethers Contract');
  }
  return _contract;
}
