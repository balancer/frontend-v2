import { BigNumber } from '@ethersproject/bignumber';
import { initEthersContract } from './EthersContract';

export const mockedOnchainTokenName = 'mocked onchain token name';

export const defaultAdjustedBalance = '55555';

export const defaultBatchSwapResponse = 'Batch Swap response';

export const defaultContractBalance = BigNumber.from(321);
interface IContract {
  // Equivalent to readonly estimateGas property in Contract
  estimateGas: {
    [key: string]: () => Promise<BigNumber>;
  };
  batchSwap: () => Promise<string>;
}
// We cannot extend Contract due to read-only properties, but we can mimic its type implementing IContract
export class MockedContractWithSigner implements IContract {
  estimateGas = {
    swap: () => Promise.resolve(BigNumber.from(2)),
    batchSwap: () => {
      return Promise.resolve(BigNumber.from(1));
    },
  };

  batchSwap = vi.fn(async () => defaultBatchSwapResponse);
  swap = vi.fn();
  hasApprovedRelayer() {
    return false;
  }
  adjustedBalanceOf() {
    return defaultAdjustedBalance;
  }
  balanceOf() {
    return Promise.resolve(defaultContractBalance);
  }
}

export function initEthersContractWithDefaultMocks() {
  //@ts-ignore
  initEthersContract(MockedContractWithSigner);
}
