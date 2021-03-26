import { Decimal } from 'decimal.js';
import { BigNumber } from '@ethersproject/bignumber';

import {
  BigNumberish,
  bn,
  decimal,
  fp,
  fromFp,
  toFp
} from '@/utils/balancer/helpers/numbers';

export function calcBptOutGivenExactTokensIn(
  fpBalances: BigNumberish[],
  fpWeights: BigNumberish[],
  fpAmountsIn: BigNumberish[],
  fpBptTotalSupply: BigNumberish,
  fpSwapFee: BigNumberish
): BigNumberish {
  const weights = toNormalizedWeights(fpWeights);
  const balances = fpBalances.map(fromFp);
  const amountsIn = fpAmountsIn.map(fromFp);
  const bptTotalSupply = fromFp(fpBptTotalSupply);

  const balanceRatiosWithoutFee = [] as Decimal[];
  let weightedBalanceRatio = decimal(0);
  for (let i = 0; i < balances.length; i++) {
    const balanceRatioWithoutFee = balances[i]
      .add(amountsIn[i])
      .div(balances[i]);
    balanceRatiosWithoutFee.push(balanceRatioWithoutFee);
    weightedBalanceRatio = weightedBalanceRatio.add(
      balanceRatioWithoutFee.mul(weights[i])
    );
  }

  let invariantRatio = decimal(1);
  for (let i = 0; i < fpBalances.length; i++) {
    const tokenBalancePercentageExcess =
      weightedBalanceRatio >= balanceRatiosWithoutFee[i]
        ? decimal(0)
        : balanceRatiosWithoutFee[i]
            .sub(weightedBalanceRatio)
            .div(balanceRatiosWithoutFee[i].sub(1));

    const amountInAfterFee = amountsIn[i].mul(
      decimal(1).sub(tokenBalancePercentageExcess.mul(fromFp(fpSwapFee)))
    );
    const tokenBalanceRatio = amountInAfterFee.div(balances[i]).add(1);
    invariantRatio = invariantRatio.mul(tokenBalanceRatio.pow(weights[i]));
  }

  const bptOut = bptTotalSupply.mul(invariantRatio.sub(1));
  return fp(bptOut);
}

export function toNormalizedWeights(rawWeights: BigNumberish[]): Decimal[] {
  const weights = rawWeights.map(decimal);
  const sum = weights.reduce((total, weight) => total.add(weight), decimal(0));
  return weights.map(weight => weight.div(sum));
}
