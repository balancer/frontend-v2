// README
// Copy & pasted functions from balancer-sor#solidity helpers.
// Once that branch is merged and published, remove this file and fix references.

import { bnum } from '@/utils/balancer/helpers/sor/FixedPoint';
import * as FixedPoint from '@/utils/balancer/helpers/sor/FixedPoint';
import { FixedPoint as FpBigNumber } from '@/utils/balancer/helpers/sor/FixedPoint';
import { BigNumber } from '@/utils/balancer/helpers/sor/bignumber';

export function exactTokensInForBPTOut(
  balances: FpBigNumber[],
  normalizedWeights: FpBigNumber[],
  amountsIn: FpBigNumber[],
  bptTotalSupply: FpBigNumber,
  swapFee: FpBigNumber
): FpBigNumber {
  // BPT out, so we round down overall.

  // First loop to calculate the weighted balance ratio
  // The increment `amountIn` represents for each token, as a quotient of new and current balances: BigNumber,
  // not accounting swap fees
  const tokenBalanceRatiosWithoutFee = new Array(amountsIn.length);
  // The weighted sum of token balance rations sans fee
  let weightedBalanceRatio = bnum(0);
  for (let i = 0; i < balances.length; i++) {
    tokenBalanceRatiosWithoutFee[i] = balances[i]
      .add(amountsIn[i])
      .divDown(balances[i]);
    weightedBalanceRatio = weightedBalanceRatio.add(
      tokenBalanceRatiosWithoutFee[i].mulDown(normalizedWeights[i])
    );
  }

  //Second loop to calculate new amounts in taking into account the fee on the % excess
  // The growth of the invariant caused by the join, as a quotient of the new value and the current one
  let invariantRatio = FixedPoint.ONE;
  for (let i = 0; i < balances.length; i++) {
    // Percentage of the amount supplied that will be swapped for other tokens in the pool
    let tokenBalancePercentageExcess;
    // Some tokens might have amounts supplied in excess of a 'balanced' join: these are identified if
    // the token's balance ratio sans fee is larger than the weighted balance ratio, and swap fees charged
    // on the amount to swap
    if (weightedBalanceRatio >= tokenBalanceRatiosWithoutFee[i]) {
      tokenBalancePercentageExcess = bnum(0);
    } else {
      tokenBalancePercentageExcess = tokenBalanceRatiosWithoutFee[i]
        .sub(weightedBalanceRatio)
        .divUp(tokenBalanceRatiosWithoutFee[i].sub(FixedPoint.ONE));
    }

    const swapFeeExcess = swapFee.mulUp(tokenBalancePercentageExcess);

    const amountInAfterFee = amountsIn[i].mulDown(swapFeeExcess.complement());

    const tokenBalanceRatio = FixedPoint.ONE.add(
      amountInAfterFee.divDown(balances[i])
    );

    invariantRatio = invariantRatio.mulDown(
      FixedPoint.powDown(tokenBalanceRatio, normalizedWeights[i])
    );
  }

  return bptTotalSupply.mulDown(invariantRatio.sub(FixedPoint.ONE));
}

// Get BPT amount for token amounts with zero-price impact
// This function is the same regardless of whether we are considering
// an Add or Remove liquidity operation: The spot prices of BPT in tokens
// are the same regardless.
export function bptForTokensZeroPriceImpact(
  balances: BigNumber[],
  decimals: number[],
  normalizedWeights: BigNumber[],
  amounts: BigNumber[],
  bptTotalSupply: BigNumber
): BigNumber {
  const zero = new BigNumber(0);
  let amountBPTOut = new BigNumber(0);
  // Calculate the amount of BPT adding this liquidity would result in
  // if there were no price impact, i.e. using the spot price of tokenIn/BPT
  for (let i = 0; i < balances.length; i++) {
    // We need to scale down all the balances and amounts
    amounts[i] = amounts[i].times(new BigNumber(10).pow(-decimals[i]));
    const poolPairData = {
      balanceIn: balances[i].times(new BigNumber(10).pow(-decimals[i])),
      balanceOut: bptTotalSupply.times(new BigNumber(10).pow(-18)),
      weightIn: normalizedWeights[i].times(new BigNumber(10).pow(-18)),
      swapFee: zero
    };
    const BPTPrice = spotPriceAfterSwapTokenInForExactBPTOut(
      zero,
      poolPairData
    );
    amountBPTOut = amountBPTOut.plus(amounts[i].div(BPTPrice));
  }
  // We need to scale up the amount of BPT out
  return amountBPTOut.times(new BigNumber(10).pow(18));
}

// PairType = 'token->BPT'
// SwapType = 'swapExactOut'
export function spotPriceAfterSwapTokenInForExactBPTOut(
  amount,
  poolPairData
): BigNumber {
  const Bi = poolPairData.balanceIn.toNumber();
  const Bbpt = poolPairData.balanceOut.toNumber();
  const wi = poolPairData.weightIn.toNumber();
  const Aobpt = amount.toNumber();
  const f = poolPairData.swapFee.toNumber();
  return bnum(
    (((Aobpt + Bbpt) / Bbpt) ** (1 / wi) * Bi) /
      ((Aobpt + Bbpt) * (1 + f * (-1 + wi)) * wi)
  );
}
