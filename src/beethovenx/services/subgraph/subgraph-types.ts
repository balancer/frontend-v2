import { Pool } from '@/services/balancer/subgraph/types';

export interface Farm {
  id: string;
  pair: string;
  allocPoint: number;
  slpBalance: string;
  masterChef: {
    id: string;
    totalAllocPoint: number;
    beetsPerBlock: string;
  };
  rewarder?: {
    id: string;
    rewardToken: string;
    rewardPerSecond: string;
  };
}

export interface FarmUser {
  id: string;
  pendingBeets: number;
  pendingBeetsValue: number;
  amount: string;
  rewardDebt: number;
  beetsHarvested: number;
  farmId: string;
  pendingRewardTokens: {
    address: string;
    symbol: string;
    balance: string;
    balanceUSD: string;
  }[];
}

export interface DecoratedFarm extends Farm {
  tvl: number;
  rewards: number;
  stake: number;
  pendingBeets: number;
  pendingBeetsValue: number;
  apr: number;
  share: number;
  userBpt: number;

  pendingRewardTokens: {
    address: string;
    symbol: string;
    balance: string;
    balanceUSD: string;
  }[];
}

export interface DecoratedPoolWithFarm extends Pool {
  decoratedFarm?: DecoratedFarm;
}

export interface DecoratedPoolWithRequiredFarm extends Pool {
  decoratedFarm: DecoratedFarm;
}
