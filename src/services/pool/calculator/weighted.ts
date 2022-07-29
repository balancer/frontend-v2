import { weightedBPTForTokensZeroPriceImpact as _bptForTokensZeroPriceImpact } from '@balancer-labs/sdk';
import { formatUnits, parseUnits } from '@ethersproject/units';
import * as SDK from '@georgeroman/balancer-v2-pools';
import OldBigNumber from 'bignumber.js';

import { bnum } from '@/lib/utils';

import Calculator from './calculator.sevice';
import { PiOptions } from './calculator.sevice';

export default class Weighted {
  calc: Calculator;

  constructor(calculator) {
    this.calc = calculator;
  }

  public exactTokensInForBPTOut(tokenAmounts: string[]): OldBigNumber {
    const balances = this.calc.poolTokenBalances.map(b => bnum(b.toString()));
    const weights = this.calc.poolTokenWeights.map(w => bnum(w.toString()));
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => bnum(a.toString()));

    return SDK.WeightedMath._calcBptOutGivenExactTokensIn(
      balances,
      weights,
      amounts,
      bnum(this.calc.poolTotalSupply.toString()),
      bnum(this.calc.poolSwapFee.toString())
    );
  }

  public bptInForExactTokensOut(tokenAmounts: string[]): OldBigNumber {
    const balances = this.calc.poolTokenBalances.map(b => bnum(b.toString()));
    const weights = this.calc.poolTokenWeights.map(w => bnum(w.toString()));
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => bnum(a.toString()));

    return SDK.WeightedMath._calcBptInGivenExactTokensOut(
      balances,
      weights,
      amounts,
      bnum(this.calc.poolTotalSupply.toString()),
      bnum(this.calc.poolSwapFee.toString())
    );
  }

  public bptInForExactTokenOut(
    amount: string,
    tokenIndex: number
  ): OldBigNumber {
    const tokenBalance = bnum(
      this.calc.poolTokenBalances[tokenIndex].toString()
    );
    const tokenNormalizedWeight = bnum(
      this.calc.poolTokenWeights[tokenIndex].toString()
    );
    const tokenAmountOut = bnum(
      parseUnits(amount, this.calc.poolTokenDecimals[tokenIndex]).toString()
    );
    const bptTotalSupply = bnum(this.calc.poolTotalSupply.toString());
    const swapFee = bnum(this.calc.poolSwapFee.toString());

    return SDK.WeightedMath._calcBptInGivenExactTokenOut(
      tokenBalance,
      tokenNormalizedWeight,
      tokenAmountOut,
      bptTotalSupply,
      swapFee
    );
  }

  public exactBPTInForTokenOut(
    bptAmount: string,
    tokenIndex: number
  ): OldBigNumber {
    const tokenBalance = bnum(
      this.calc.poolTokenBalances[tokenIndex].toString()
    );
    const tokenNormalizedWeight = bnum(
      this.calc.poolTokenWeights[tokenIndex].toString()
    );

    return SDK.WeightedMath._calcTokenOutGivenExactBptIn(
      tokenBalance,
      tokenNormalizedWeight,
      bnum(bptAmount),
      bnum(this.calc.poolTotalSupply.toString()),
      bnum(this.calc.poolSwapFee.toString())
    );
  }

  public priceImpact(tokenAmounts: string[], opts: PiOptions): OldBigNumber {
    let bptAmount, bptZeroPriceImpact;

    if (this.calc.action === 'join') {
      bptAmount = this.exactTokensInForBPTOut(tokenAmounts);
      if (bptAmount < 0) return bnum(0);
      bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts);

      return bnum(1).minus(bptAmount.div(bptZeroPriceImpact));
    } else {
      // Single asset exit
      if (opts.exactOut) {
        bptAmount = this.bptInForExactTokensOut(tokenAmounts);
        bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts);
      } else {
        bptAmount =
          opts.queryBPT ||
          parseUnits(this.calc.bptBalance, this.calc.poolDecimals).toString();
        tokenAmounts = this.calc.pool.value.tokensList.map((_, i) => {
          if (i !== opts.tokenIndex) return '0';
          const tokenAmount = this.exactBPTInForTokenOut(
            bptAmount,
            opts.tokenIndex
          ).toString();
          return formatUnits(
            tokenAmount,
            this.calc.poolTokenDecimals[opts.tokenIndex]
          ).toString();
        });
        bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts);
      }

      return bnum(bptAmount).div(bptZeroPriceImpact).minus(1);
    }
  }

  public bptForTokensZeroPriceImpact(tokenAmounts: string[]): OldBigNumber {
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );

    return bnum(
      _bptForTokensZeroPriceImpact(
        this.calc.poolTokenBalances,
        this.calc.poolTokenDecimals,
        this.calc.poolTokenWeights,
        denormAmounts,
        this.calc.poolTotalSupply
      ).toString()
    );
  }
}
