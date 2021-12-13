import {
  addSeconds,
  differenceInSeconds,
  format,
  isBefore,
  parse,
  differenceInCalendarDays
} from 'date-fns';
import { zip } from 'lodash';
import { LbpData } from '@/beethovenx/lbp/lbp-types';

const NUM_STEPS = 48;

export function getLbpChartPredictedPriceData(
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
  }: LbpData,
  collateralTokenPrice: number
) {
  const startDateObj = parseDateForDateAndTime(startDate, startTime);
  const endDateObj = parseDateForDateAndTime(endDate, endTime);
  const timeStep = differenceInSeconds(endDateObj, startDateObj) / NUM_STEPS;
  const tokenWeightStep = (tokenStartWeight - tokenEndWeight) / NUM_STEPS;
  const collateralWeightStep =
    (collateralEndWeight - collateralStartWeight) / NUM_STEPS;
  const tokenBalance = parseFloat(tokenAmount);
  const collateralBalance = parseFloat(collateralAmount);
  let tokenWeight = tokenStartWeight;
  let collateralWeight = collateralStartWeight;
  const predicted: number[] = [
    (((tokenWeight / collateralWeight) * collateralBalance) / tokenBalance) *
      collateralTokenPrice
  ];
  const times: string[] = [format(startDateObj, 'yyyy-MM-dd HH:mm:ss')];
  let timestamp = startDateObj;

  while (isBefore(addSeconds(timestamp, timeStep), endDateObj)) {
    timestamp = addSeconds(timestamp, timeStep);
    tokenWeight -= tokenWeightStep;
    collateralWeight += collateralWeightStep;

    const tokenPrice =
      (((tokenWeight / collateralWeight) * collateralBalance) / tokenBalance) *
      collateralTokenPrice;

    predicted.push(tokenPrice);
    times.push(format(timestamp, 'yyyy-MM-dd HH:mm:ss'));
  }

  times.push(format(endDateObj, 'yyyy-MM-dd HH:mm:ss'));
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
}: LbpData): number {
  const startDateObj = parseDateForDateAndTime(startDate, startTime);
  const endDateObj = parseDateForDateAndTime(endDate, endTime);

  return differenceInCalendarDays(endDateObj, startDateObj);
}

function parseDateForDateAndTime(date: string, time: string) {
  return parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
}
