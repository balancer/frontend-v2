import BigNumber from 'bignumber.js';

import { bnum } from '@/lib/utils';

const MIN_BOOST = 1;
const MAX_BOOST = 2.5;

export function calculateWeeklyReward(
  workingSupply: BigNumber,
  balPayableToGauge: BigNumber
) {
  const workingBalance = 0.4;
  const shareForOneBpt = bnum(workingBalance).div(
    workingSupply.plus(workingBalance)
  );
  const weeklyReward = shareForOneBpt.times(balPayableToGauge);
  return weeklyReward;
}

export function calculateBalPayableToGauge(
  inflationRate: BigNumber,
  gaugeRelativeWeight: BigNumber
) {
  return bnum(inflationRate)
    .times(7)
    .times(86400)
    .times(gaugeRelativeWeight);
}

export function calculateGaugeApr({
  gaugeAddress,
  inflationRate,
  balPrice,
  bptPrice,
  workingSupplies,
  relativeWeights,
  boost = '1'
}: {
  gaugeAddress: string;
  inflationRate: string;
  balPrice: string;
  bptPrice: string;
  boost: string;
  workingSupplies: Record<string, string>;
  relativeWeights: Record<string, string>;
}) {
  const workingSupply = bnum((workingSupplies || {})[gaugeAddress]) || '0';
  const relativeWeight = bnum((relativeWeights || {})[gaugeAddress]) || '0';
  const balPayable = calculateBalPayableToGauge(
    bnum(inflationRate),
    relativeWeight
  );
  const weeklyReward = calculateWeeklyReward(workingSupply, balPayable);
  const yearlyReward = weeklyReward
    .times(boost)
    .times(52)
    .times(balPrice);
  const apr = yearlyReward.div(bptPrice);
  return apr;
}

export function getAprRange(apr: string) {
  const min = bnum(apr).times(MIN_BOOST);
  const max = bnum(apr).times(MAX_BOOST);
  return {
    min: min.toString(),
    max: max.toString()
  };
}
