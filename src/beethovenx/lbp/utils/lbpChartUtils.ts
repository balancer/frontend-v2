import {
  addSeconds,
  differenceInSeconds,
  format,
  isBefore,
  parse,
  differenceInCalendarDays,
  parseISO,
  formatISO,
  getUnixTime,
  fromUnixTime
} from 'date-fns';
import { zip } from 'lodash';
import { LgeData } from '@/beethovenx/lbp/lbp-types';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';
import {
  FullPool,
  PoolToken,
  SubgraphSwap,
  SubgraphTokenPrice
} from '@/services/balancer/subgraph/types';

const NUM_STEPS = 48;

export function getLbpPreviewChartPredictedPriceData(
  {
    tokenAmount,
    tokenStartWeight,
    tokenEndWeight,
    collateralAmount,
    collateralStartWeight,
    collateralEndWeight,
    startDate,
    startTime,
    endDate,
    endTime
  }: LgeData,
  collateralTokenPrice: number
) {
  const startDateObj = parseDateForDateAndTime(startDate, startTime);
  const endDateObj = parseDateForDateAndTime(endDate, endTime);

  return getLbpChartPredictedPriceData({
    firstTime: startDateObj,
    endTime: endDateObj,
    tokenCurrentWeight: tokenStartWeight,
    tokenEndWeight,
    collateralCurrentWeight: collateralStartWeight,
    collateralEndWeight,
    tokenBalance: parseFloat(tokenAmount),
    collateralTokenPrice,
    collateralBalance: parseFloat(collateralAmount),
    numSteps: NUM_STEPS
  });
}

export function getLbpChartPredictedPriceData({
  firstTime,
  endTime,
  tokenCurrentWeight,
  tokenEndWeight,
  collateralCurrentWeight,
  collateralEndWeight,
  tokenBalance,
  collateralBalance,
  collateralTokenPrice,
  numSteps
}: {
  firstTime: Date;
  endTime: Date;
  tokenCurrentWeight: number;
  tokenEndWeight: number;
  collateralCurrentWeight: number;
  collateralEndWeight: number;
  tokenBalance: number;
  collateralBalance: number;
  collateralTokenPrice: number;
  numSteps: number;
}) {
  const timeStep = differenceInSeconds(endTime, firstTime) / numSteps;
  const tokenWeightStep = (tokenCurrentWeight - tokenEndWeight) / numSteps;
  const collateralWeightStep =
    (collateralEndWeight - collateralCurrentWeight) / numSteps;

  let tokenWeight = tokenCurrentWeight;
  let collateralWeight = collateralCurrentWeight;
  const predicted: number[] = [
    calculateLbpTokenPrice({
      tokenWeight,
      collateralWeight,
      collateralBalance,
      tokenBalance,
      collateralTokenPrice
    })
  ];

  const times: string[] = [format(firstTime, 'yyyy-MM-dd HH:mm:ss')];
  let timestamp = firstTime;

  while (isBefore(addSeconds(timestamp, timeStep), endTime)) {
    timestamp = addSeconds(timestamp, timeStep);
    tokenWeight -= tokenWeightStep;
    collateralWeight += collateralWeightStep;

    const tokenPrice = calculateLbpTokenPrice({
      tokenWeight,
      collateralWeight,
      collateralBalance,
      tokenBalance,
      collateralTokenPrice
    });

    predicted.push(tokenPrice);
    times.push(format(timestamp, 'yyyy-MM-dd HH:mm:ss'));
  }

  times.push(format(endTime, 'yyyy-MM-dd HH:mm:ss'));
  predicted.push(
    calculateLbpTokenPrice({
      tokenWeight: tokenEndWeight,
      collateralWeight: collateralEndWeight,
      collateralBalance,
      tokenBalance,
      collateralTokenPrice
    })
  );

  return zip(times, predicted);
}

export function getLbpChartTokenPriceData({
  lge,
  collateralTokenPrice,
  numSteps,
  startsAt,
  endsAt,
  swaps
}: {
  lge: GqlLge;
  swaps: SubgraphSwap[];
  collateralTokenPrice: number;
  numSteps: number;
  startsAt: Date;
  endsAt: Date;
}) {
  const launchToken = lge.tokenContractAddress.toLowerCase();
  const collateralToken = lge.collateralTokenAddress.toLowerCase();
  const now = new Date();
  const hasEnded = isBefore(endsAt, now);
  const endTime = hasEnded ? endsAt : now;
  const startTimestamp = getUnixTime(startsAt);
  const endTimestamp = hasEnded ? getUnixTime(endsAt) : getUnixTime(new Date());
  const lgeEndTimestamp = getUnixTime(endsAt);
  let tokenBalance = parseFloat(lge.tokenAmount);
  let collateralBalance = parseFloat(lge.collateralAmount);
  const timeStep = differenceInSeconds(endTime, startsAt) / numSteps;

  const prices: number[] = [];
  const times: string[] = [];
  let timestamp = getUnixTime(startsAt);

  while (timestamp <= endTimestamp) {
    const { tokenWeight, collateralWeight } = getWeightsAtTime(
      timestamp,
      lge,
      startTimestamp,
      lgeEndTimestamp
    );

    prices.push(
      calculateLbpTokenPrice({
        tokenWeight,
        collateralWeight,
        collateralBalance,
        tokenBalance,
        collateralTokenPrice
      })
    );
    times.push(format(fromUnixTime(timestamp), 'yyyy-MM-dd HH:mm:ss'));

    const filtered = getSwapsInTimeRange(
      swaps,
      timestamp,
      timestamp + timeStep
    );

    for (const swap of filtered) {
      const amountIn = parseFloat(swap.tokenAmountIn);
      const amountOut = parseFloat(swap.tokenAmountOut);

      tokenBalance += swap.tokenIn === launchToken ? amountIn : -amountOut;
      collateralBalance +=
        swap.tokenIn === collateralToken ? amountIn : -amountOut;

      const { tokenWeight, collateralWeight } = getWeightsAtTime(
        swap.timestamp,
        lge,
        startTimestamp,
        lgeEndTimestamp
      );

      times.push(format(fromUnixTime(swap.timestamp), 'yyyy-MM-dd HH:mm:ss'));
      prices.push(
        calculateLbpTokenPrice({
          tokenWeight,
          collateralWeight,
          collateralBalance,
          tokenBalance,
          collateralTokenPrice
        })
      );
    }

    timestamp += timeStep;
  }

  return zip(times, prices);
}

export function getLbpNumDays({
  startDate,
  startTime,
  endDate,
  endTime
}: LgeData): number {
  const startDateObj = parseDateForDateAndTime(startDate, startTime);
  const endDateObj = parseDateForDateAndTime(endDate, endTime);

  return differenceInCalendarDays(endDateObj, startDateObj);
}

function parseDateForDateAndTime(date: string, time: string) {
  return parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
}

export function calculateLbpTokenPrice({
  tokenWeight,
  tokenBalance,
  collateralTokenPrice,
  collateralBalance,
  collateralWeight
}: {
  tokenWeight: number;
  collateralWeight: number;
  tokenBalance: number;
  collateralBalance: number;
  collateralTokenPrice: number;
}) {
  return (
    (((tokenWeight / collateralWeight) * collateralBalance) / tokenBalance) *
    collateralTokenPrice
  );
}

function getSwapsInTimeRange(
  tokenPrices: SubgraphSwap[],
  startTimestamp: number,
  endTimestamp: number
): SubgraphSwap[] {
  return tokenPrices.filter(
    tokenPrice =>
      tokenPrice.timestamp > startTimestamp &&
      tokenPrice.timestamp <= endTimestamp
  );
}

function getWeightsAtTime(
  timestamp: number,
  {
    tokenStartWeight,
    tokenEndWeight,
    collateralStartWeight,
    collateralEndWeight
  }: GqlLge,
  startTimestamp: number,
  endTimestamp: number
): { tokenWeight: number; collateralWeight: number } {
  const percentComplete =
    (timestamp - startTimestamp) / (endTimestamp - startTimestamp);

  const tokenWeight =
    tokenStartWeight - (tokenStartWeight - tokenEndWeight) * percentComplete;
  const collateralWeight =
    collateralStartWeight -
    (collateralStartWeight - collateralEndWeight) * percentComplete;

  return { tokenWeight, collateralWeight };
}
