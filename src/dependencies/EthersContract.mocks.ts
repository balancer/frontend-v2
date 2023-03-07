import { BigNumber } from '@ethersproject/bignumber';
import { initEthersContract } from './EthersContract';

export const mockedOnchainTokenName = 'mocked onchain token name';

export const defaultAdjustedBalance = '55555';

// We cannot extend Contract cause the checks in its constructor throw errors
export class MockedContractWithSigner {
  estimateGas = {
    swap: () => Promise.resolve(BigNumber.from(2)),
    batchSwap: () => Promise.resolve(BigNumber.from(1)),
  };
  batchSwap = vi.fn();
  swap = vi.fn();
  hasApprovedRelayer() {
    return false;
  }
  adjustedBalanceOf() {
    return defaultAdjustedBalance;
  }
}

export function initEthersContractWithDefaultMocks() {
  //@ts-ignore
  initEthersContract(MockedContractWithSigner);
}
