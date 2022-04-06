import BigNumber from 'bignumber.js';
import { formatUnits, getAddress } from 'ethers/lib/utils';

import { bnum } from '@/lib/utils';
import { TokenInfoMap } from '@/types/TokenList';

import { RewardTokenData } from '../balancer/contracts/contracts/liquidity-gauge';
import { TokenPrices } from '../coingecko/api/price.service';

const MIN_BOOST = 1;
const MAX_BOOST = 2.5;

export function calculateWeeklyReward(
  workingBalance = 0.4,
  workingSupply: BigNumber,
  balPayableToGauge: BigNumber
) {
  const shareForOneBpt = bnum(workingBalance).div(
    workingSupply.plus(workingBalance)
  );
  const weeklyReward = shareForOneBpt.times(balPayableToGauge);
  return weeklyReward;
}

export function calculateTokenPayableToGauge(
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
  boost = '1',
  rewardTokenData = {},
  prices,
  tokens
}: {
  gaugeAddress: string;
  inflationRate: string;
  balPrice: string;
  bptPrice: string;
  boost: string;
  workingSupplies: Record<string, string>;
  relativeWeights: Record<string, string>;
  rewardTokenData: Record<string, RewardTokenData>;
  prices: TokenPrices;
  tokens: TokenInfoMap;
}): {
  apr: string;
  rewardTokenAprs: Record<string, string>;
} {
  const workingSupply = bnum((workingSupplies || {})[gaugeAddress]) || '0';
  const relativeWeight = bnum((relativeWeights || {})[gaugeAddress]) || '0';
  const balPayable = calculateTokenPayableToGauge(
    bnum(inflationRate),
    relativeWeight
  );
  // 0.4 is the working balance for 1 BPT
  const weeklyReward = calculateWeeklyReward(0.4, workingSupply, balPayable);
  const yearlyReward = weeklyReward
    .times(boost)
    .times(52)
    .times(balPrice);

  // bal apr
  const balApr = yearlyReward.div(bptPrice).toString();

  const rewardTokenAprs = Object.keys(rewardTokenData).map(
    rewardTokenAddress => {
      const data = rewardTokenData[rewardTokenAddress];
      const inflationRate = formatUnits(
        data.rate,
        tokens[getAddress(rewardTokenAddress)].decimals
      );
      // for reward tokens, there is no relative weight
      // all tokens go to the gauge depositors
      const tokenPayable = calculateTokenPayableToGauge(
        bnum(inflationRate),
        bnum(1)
      );
      // for reward tokens we need to use the raw balance (1BPT = 1)
      const weeklyReward = calculateWeeklyReward(
        1,
        workingSupply,
        tokenPayable
      );
      const yearlyReward = weeklyReward
        .times(boost)
        .times(52)
        .times(prices[rewardTokenAddress].usd);
      const apr = yearlyReward.div(bptPrice);
      return [rewardTokenAddress, apr.toString()];
    }
  );

  return {
    apr: balApr,
    rewardTokenAprs: Object.fromEntries(rewardTokenAprs)
  };
}

export function getAprRange(apr: string) {
  const min = bnum(apr).times(MIN_BOOST);
  const max = bnum(apr).times(MAX_BOOST);
  return {
    min: min.toString(),
    max: max.toString()
  };
}
