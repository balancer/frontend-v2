import { differenceInWeeks } from 'date-fns';
import { groupBy, mapValues, mergeWith, add } from 'lodash';
import { bnum } from '..';

import LiquidityMiningV2 from './LiquidityMiningV2.json';

type LiquidityMiningSlot = Record<string, string>;

type LiquidityMiningTierLevel = '1' | '2' | '3';

type LiquidityMiningTier = {
  BAL: number;
  slots: LiquidityMiningSlot;
};

type LiquidityMiningWeek = {
  tiers: Record<LiquidityMiningTierLevel, LiquidityMiningTier>;
};

type LiquidityMiningRewards = Record<string, number>;

// Liquidity mining started on June 1, 2020
function getCurrentLiquidityMiningWeek() {
  return differenceInWeeks(new Date(), new Date(2020, 5, 1)) + 1;
}

function computeRewardsForTier(tier: LiquidityMiningTier) {
  return mapValues(groupBy(tier.slots), slot => slot.length * tier.BAL);
}

export function computeAPYForPool(
  rewards: number,
  BALPrice: number,
  totalLiquidity: string
) {
  return bnum(rewards)
    .div(7)
    .times(BALPrice)
    .times(365)
    .div(totalLiquidity)
    .toString();
}

export function getLiquidityMiningRewards(
  week: number | 'current' = 'current'
) {
  const miningWeek =
    week === 'current' ? getCurrentLiquidityMiningWeek() : week;

  const miningRewards: LiquidityMiningRewards = {};

  const liquidityMiningWeek = LiquidityMiningV2[
    `week_${miningWeek}`
  ] as LiquidityMiningWeek;

  if (liquidityMiningWeek) {
    Object.values(liquidityMiningWeek.tiers).forEach(tier => {
      mergeWith(miningRewards, computeRewardsForTier(tier), add);
    });
  }

  return miningRewards;
}

export const currentLiquidityMiningRewards = getLiquidityMiningRewards();
