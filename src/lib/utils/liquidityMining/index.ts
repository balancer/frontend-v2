import { differenceInWeeks } from 'date-fns';

import { bnum } from '@/lib/utils';
import { toUtcTime } from '@/lib/utils/date';

import { NetworkId } from '@/constants/network';

import ConfigService from '@/services/config/config.service';

import { Prices } from '@/services/coingecko';

import MultiTokenLiquidityMining from './MultiTokenLiquidityMining.json';

type PoolId = string;

type LiquidityMiningTokenRewards = {
  tokenAddress: string;
  amount: number;
};

type LiquidityMiningPools = Record<PoolId, LiquidityMiningTokenRewards[]>;

type LiquidityMiningWeek = Array<{
  chainId: NetworkId;
  pools: LiquidityMiningPools;
}>;

// Liquidity mining started on June 1, 2020 00:00 UTC
const liquidityMiningStartTime = Date.UTC(2020, 5, 1, 0, 0);

function getCurrentLiquidityMiningWeek() {
  return differenceInWeeks(toUtcTime(new Date()), liquidityMiningStartTime) + 1;
}

function getWeek(miningWeek: number) {
  return `week_${miningWeek}`;
}

export function computeAPYForPool(
  rewards: number,
  tokenPrice: number | null | undefined,
  totalLiquidity: string
) {
  // Guard against null price
  return tokenPrice != null
    ? bnum(rewards)
        .div(7)
        .times(tokenPrice)
        .times(365)
        .div(totalLiquidity)
        .toString()
    : '0';
}

export function computeTotalAPYForPool(
  tokenRewards: LiquidityMiningTokenRewards[],
  prices: Prices,
  totalLiquidity: string
) {
  return tokenRewards
    .reduce(
      (totalRewards, { amount, tokenAddress }) =>
        totalRewards.plus(
          computeAPYForPool(
            amount,
            prices[tokenAddress.toLowerCase()]?.price,
            totalLiquidity
          )
        ),
      bnum(0)
    )
    .toString();
}

export function getLiquidityMiningRewards(
  week: number | 'current' = 'current'
) {
  const configService: ConfigService = new ConfigService();

  const miningWeek =
    week === 'current' ? getCurrentLiquidityMiningWeek() : week;

  const miningRewards: LiquidityMiningPools = {};

  const liquidityMiningWeek = MultiTokenLiquidityMining[
    getWeek(miningWeek)
  ] as LiquidityMiningWeek;

  if (liquidityMiningWeek) {
    Object.assign(
      miningRewards,
      liquidityMiningWeek.find(
        pool => pool.chainId === Number(configService.env.NETWORK)
      )?.pools
    );
  }

  return miningRewards;
}

export const currentLiquidityMiningRewards = getLiquidityMiningRewards();
