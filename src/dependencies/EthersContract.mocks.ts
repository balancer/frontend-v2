import { Contract } from '@ethersproject/contracts';
import { initEthersContract } from './EthersContract';

export const mockedOnchainTokenName = 'mocked onchain token name';

export class EthersContractMock extends Contract {
  hasApprovedRelayer() {
    return false;
  }
}

export function generateEthersContractMock() {
  return EthersContractMock;
}

export function initEthersContractWithDefaultMocks() {
  initEthersContract(generateEthersContractMock());
}
