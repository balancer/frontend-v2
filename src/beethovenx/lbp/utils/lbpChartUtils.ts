import {
  addSeconds,
  differenceInSeconds,
  format,
  isBefore,
  parse,
  differenceInCalendarDays
} from 'date-fns';
import { zip } from 'lodash';
import { LgeData } from '@/beethovenx/lbp/lbp-types';

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
    (((tokenWeight / collateralWeight) * collateralBalance) / tokenBalance) *
      collateralTokenPrice
  ];
  const times: string[] = [format(firstTime, 'yyyy-MM-dd HH:mm:ss')];
  let timestamp = firstTime;

  while (isBefore(addSeconds(timestamp, timeStep), endTime)) {
    timestamp = addSeconds(timestamp, timeStep);
    tokenWeight -= tokenWeightStep;
    collateralWeight += collateralWeightStep;

    const tokenPrice =
      (((tokenWeight / collateralWeight) * collateralBalance) / tokenBalance) *
      collateralTokenPrice;

    predicted.push(tokenPrice);
    times.push(format(timestamp, 'yyyy-MM-dd HH:mm:ss'));
  }

  times.push(format(endTime, 'yyyy-MM-dd HH:mm:ss'));
  predicted.push(
    (((tokenEndWeight / collateralEndWeight) * collateralBalance) /
      tokenBalance) *
      collateralTokenPrice
  );

  return zip(times, predicted);
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
