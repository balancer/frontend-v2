import { Contract } from '@ethersproject/contracts';
import { initEthersContract } from './EthersContract';

export const mockedOnchainTokenName = 'mocked onchain token name';

export const defaultAdjustedBalance = '55555';
export class EthersContractMock extends Contract {
  hasApprovedRelayer() {
    return false;
  }
  adjustedBalanceOf() {
    return defaultAdjustedBalance;
  }
}

export function generateEthersContractMock() {
  return EthersContractMock;
}

export function initEthersContractWithDefaultMocks() {
  initEthersContract(generateEthersContractMock());
}
