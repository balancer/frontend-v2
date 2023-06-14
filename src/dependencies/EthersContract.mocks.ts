import { BigNumber } from '@ethersproject/bignumber';
import { initEthersContract } from './EthersContract';

export const mockedOnchainTokenName = 'mocked onchain token name';

export const defaultAdjustedBalance = '55555';

export const defaultBatchSwapResponse = 'Batch Swap response';

export const defaultTotalSupply = '9747054';
export const defaultContractBalance = '321';
export const defaultContractBalanceBN = BigNumber.from(defaultContractBalance);
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
  totalSupply() {
    return Promise.resolve(defaultTotalSupply);
  }
  balanceOf() {
    return Promise.resolve(defaultContractBalanceBN);
  }

  connect() {
    return this;
  }
}

export function initEthersContractWithDefaultMocks() {
  //@ts-ignore
  initEthersContract(MockedContractWithSigner);
}
