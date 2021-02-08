import { BigNumber } from '@ethersproject/bignumber';

export interface Pool {
  address: string;
  id: string;
  strategy: Strategy;
  tokenBalances: BigNumber[];
  tokens: string[];
  totalSupply: BigNumber;
}

export interface Strategy {
  name: string;
  swapFee: BigNumber;
  swapFeePercent: number;
  type: number;
  weights?: BigNumber[];
  weightsPercent?: number[];
}
