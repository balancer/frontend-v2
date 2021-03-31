import Calculator from '.';
import { PiOptions } from '.';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { bnum } from '@/utils';
import BigNumber from 'bignumber.js';
import {
  exactTokensInForBPTOut,
  bptInForExactTokensOut,
  exactBPTInForTokenOut,
  bptForTokensZeroPriceImpact
} from './helpers/math/weighted';
import {
  bnum as fpBnum,
  FixedPoint as FpBigNumber
} from '@/utils/balancer/helpers/sor/FixedPoint';

export default class Weighted {
  calc: Calculator;

  constructor(calculator) {
    this.calc = calculator;
  }

  public priceImpact(tokenAmounts: string[], opts: PiOptions): BigNumber {
    let bptAmount, bptZeroPriceImpact;

    if (this.calc.action === 'join') {
      bptAmount = this.exactTokensInForBPTOut(tokenAmounts);
      bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts);

      return bnum(1).minus(bptAmount.div(bptZeroPriceImpact));
    } else {
      // Single asset exit
      if (opts.exactOut) {
        bptAmount = this.bptInForExactTokensOut(tokenAmounts);
        bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts);
      } else {
        bptAmount = parseUnits(
          this.calc.bptBalance,
          this.calc.poolDecimals
        ).toString();
        tokenAmounts = this.calc.pool.tokens.map((_, i) => {
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

      return bnum(bptAmount)
        .div(bptZeroPriceImpact)
        .minus(1);
    }
  }

  private exactTokensInForBPTOut(tokenAmounts: string[]): FpBigNumber {
    const balances = this.calc.poolTokenBalances.map(b => fpBnum(b.toString()));
    const weights = this.calc.poolTokenWeights.map(w => fpBnum(w.toString()));
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => fpBnum(a.toString()));

    return exactTokensInForBPTOut(
      balances,
      weights,
      amounts,
      fpBnum(this.calc.poolTotalSupply.toString()),
      fpBnum(this.calc.poolSwapFee.toString())
    );
  }

  private bptInForExactTokensOut(tokenAmounts: string[]): FpBigNumber {
    const balances = this.calc.poolTokenBalances.map(b => fpBnum(b.toString()));
    const weights = this.calc.poolTokenWeights.map(w => fpBnum(w.toString()));
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => fpBnum(a.toString()));

    return bptInForExactTokensOut(
      balances,
      weights,
      amounts,
      fpBnum(this.calc.poolTotalSupply.toString()),
      fpBnum(this.calc.poolSwapFee.toString())
    );
  }

  private exactBPTInForTokenOut(
    bptAmount: string,
    tokenIndex: number
  ): FpBigNumber {
    const tokenBalance = fpBnum(
      this.calc.poolTokenBalances[tokenIndex].toString()
    );
    const tokenNormalizedWeight = fpBnum(
      this.calc.poolTokenWeights[tokenIndex].toString()
    );
    const bptAmountIn = fpBnum(bptAmount);

    return exactBPTInForTokenOut(
      tokenBalance,
      tokenNormalizedWeight,
      bptAmountIn,
      fpBnum(this.calc.poolTotalSupply.toString()),
      fpBnum(this.calc.poolSwapFee.toString())
    );
  }

  private bptForTokensZeroPriceImpact(tokenAmounts: string[]): BigNumber {
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => bnum(a.toString()));

    return bptForTokensZeroPriceImpact(
      this.calc.poolTokenBalances.map(b => bnum(b.toString())),
      this.calc.poolTokenDecimals,
      this.calc.poolTokenWeights.map(w => bnum(w.toString())),
      amounts,
      bnum(this.calc.poolTotalSupply.toString())
    );
  }
}
