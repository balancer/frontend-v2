import { BigNumber } from '@ethersproject/bignumber';

export interface Pool {
  address: string;
  id: string;
  strategy: Strategy;
  tokenBalances: BigNumber[];
  tokens: string[];
  totalSupply: BigNumber;
  weights: BigNumber[];
  weightsPercent: number[];
  shares?: number;
}

export interface Strategy {
  name: string;
  swapFee: BigNumber;
  swapFeePercent: number;
  type: number;
  weights?: BigNumber[];
  weightsPercent?: number[];
}
