import { Network } from '@balancer-labs/sdk';
import { getAddress } from '@ethersproject/address';
import axios from 'axios';
import { differenceInWeeks } from 'date-fns';

import { networkId } from '@/composables/useNetwork';
import { toUtcTime } from '@/composables/useTime';
import { FiatCurrency } from '@/constants/currency';
import { bnum } from '@/lib/utils';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { configService } from '@/services/config/config.service';

import { Multicaller } from '../balancer/contract';
import MultiTokenLiquidityMining from './MultiTokenLiquidityMining.json';

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

export async function getExcludedAddresses() {
  try {
    const { data } = await axios.get<Record<Network, Record<string, string[]>>>(
      'https://raw.githubusercontent.com/balancer-labs/bal-mining-scripts/master/config/exclude.json'
    );

    if (data[networkId.value]) {
      const poolMulticaller = new Multicaller(
        balancerContractsService.config.key,
        balancerContractsService.provider,
        balancerContractsService.allPoolABIs
      );

      Object.entries(data[networkId.value]).forEach(
        ([poolAddress, accounts]) => {
          accounts.forEach(account => {
            const poolAddressNormalized = getAddress(poolAddress);

            poolMulticaller.call(
              `${poolAddressNormalized}.${account}`,
              poolAddressNormalized,
              'balanceOf',
              [account]
            );
          });
        }
      );

      return await poolMulticaller.execute();
    }
  } catch (e) {
    console.log(e);
  }

  return null;
}
