import { differenceInWeeks } from 'date-fns';
import { bnum } from '@/lib/utils';
import { toUtcTime } from '@/lib/utils/date';
import { Network } from '@/composables/useNetwork';
import { configService } from '@/services/config/config.service';
import MultiTokenLiquidityMining from './MultiTokenLiquidityMining.json';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { getAddress } from '@ethersproject/address';
import { FiatCurrency } from '@/constants/currency';

type PoolId = string;

type LiquidityMiningTokenRewards = {
  tokenAddress: string;
  amount: number;
};

type LiquidityMiningPools = Record<PoolId, LiquidityMiningTokenRewards[]>;

type LiquidityMiningWeek = Array<{
  chainId: Network;
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

export function computeAPRForPool(
  rewards: number,
  tokenPrice: number | null | undefined,
  totalLiquidity: string
) {
  // Guard against null price
  if (tokenPrice === null || tokenPrice === undefined) return '0';
  return bnum(rewards)
    .div(7)
    .times(tokenPrice)
    .times(365)
    .div(totalLiquidity)
    .toString();
}

export function computeAPRsForPool(
  tokenRewards: LiquidityMiningTokenRewards[],
  prices: TokenPrices,
  currency: FiatCurrency,
  totalLiquidity: string
): { [address: string]: string } {
  const rewardAPRs = tokenRewards.map(reward => [
    getAddress(reward.tokenAddress),
    computeAPRForPool(
      reward.amount,
      prices[getAddress(reward.tokenAddress)]?.[currency],
      totalLiquidity
    )
  ]);
  return Object.fromEntries(rewardAPRs);
}

export function computeTotalAPRForPool(
  tokenRewards: LiquidityMiningTokenRewards[],
  prices: TokenPrices,
  currency: FiatCurrency,
  totalLiquidity: string
) {
  console.log(
    'PRICE',
    tokenRewards.map(({ tokenAddress }) => [
      tokenAddress,
      prices[getAddress(tokenAddress)]
    ])
  );
  return tokenRewards
    .reduce(
      (totalRewards, { amount, tokenAddress }) =>
        totalRewards.plus(
          computeAPRForPool(
            amount,
            prices[getAddress(tokenAddress)]?.[currency],
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
        pool => pool.chainId === configService.network.chainId
      )?.pools
    );
  }

  return miningRewards;
}

export const currentLiquidityMiningRewards = getLiquidityMiningRewards();
let tokenAddresses = Object.values(currentLiquidityMiningRewards)
  .flat()
  .map(reward => reward.tokenAddress);
tokenAddresses = [...new Set(tokenAddresses)].map(address =>
  getAddress(address)
);
export const currentLiquidityMiningRewardTokens = tokenAddresses;
