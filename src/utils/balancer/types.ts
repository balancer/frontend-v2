import { BigNumber } from '@ethersproject/bignumber';

export interface Pool {
  address: string;
  id: string;
  strategy: Strategy;
  tokenBalances: BigNumber[];
  tokens: string[];
  totalSupply: BigNumber;
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
