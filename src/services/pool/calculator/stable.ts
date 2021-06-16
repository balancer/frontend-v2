import Calculator from './calculator.sevice';
import { PiOptions } from './calculator.sevice';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { bnum } from '@/lib/utils';
import BigNumber from 'bignumber.js';

import {
  _exactTokensInForBPTOut,
  _exactBPTInForTokenOut,
  _tokenInForExactTokenOut,
  _bptInForExactTokensOut
} from '@balancer-labs/sor2/dist/pools/stablePool/stableMathEvm';
import { BPTForTokensZeroPriceImpact as _bptForTokensZeroPriceImpact } from '@balancer-labs/sor2/dist/frontendHelpers/weightedHelpers';
import { fnum } from '@balancer-labs/sor2/dist/math/lib/fixedPoint';
import { FixedPointNumber } from '@balancer-labs/sor2/dist/math/FixedPointNumber';
import { BigNumberish } from '@ethersproject/bignumber';

export default class Weighted {
  calc: Calculator;

  constructor(calculator) {
    this.calc = calculator;
  }

  public priceImpact(tokenAmounts: string[], opts: PiOptions): BigNumber {
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
        bptAmount = parseUnits(
          this.calc.bptBalance,
          this.calc.poolDecimals
        ).toString();
        tokenAmounts = this.calc.pool.tokensList.map((_, i) => {
          if (i !== opts.tokenIndex) return '0';
          const tokenAmount = this.exactBPTInForTokenOut(
            this.calc.bptBalance,
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

  public exactTokensInForBPTOut(tokenAmounts: string[]): any {
    const balances = this.calc.poolTokenBalances.map(b => fnum(b.toString()));
    const amp = fnum(this.calc.pool.onchain.amp?.toString() || '0');
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => fnum(a.toString()));

    return _exactTokensInForBPTOut(
      balances,
      amp,
      amounts,
      fnum(this.calc.poolTotalSupply.toString()),
      fnum(this.calc.poolSwapFee.toString())
    );
  }

  public bptInForExactTokensOut(tokenAmounts: string[]): FixedPointNumber {
    const balances = this.calc.poolTokenBalances.map(b => fnum(b.toString()));
    const amp = fnum(this.calc.pool.onchain.amp?.toString() || '0');
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => fnum(a.toString()));

    return _bptInForExactTokensOut(
      balances,
      amp,
      amounts,
      fnum(this.calc.poolTotalSupply.toString()),
      fnum(this.calc.poolSwapFee.toString())
    );
  }

  public bptInForExactTokenOut(
    amount: string,
    tokenIndex: number
  ): FixedPointNumber {
    const balances = this.calc.poolTokenBalances.map(b => fnum(b.toString()));
    const amp = fnum(this.calc.pool.onchain.amp?.toString() || '0');
    const tokenNormalizedWeight = fnum(
      this.calc.poolTokenWeights[tokenIndex].toString()
    );
    const bptAmountIn = fnum(
      parseUnits(amount, this.calc.poolTokenDecimals[tokenIndex]).toString()
    );
    const bptTotalSupply = fnum(this.calc.poolTotalSupply.toString());
    const swapFee = fnum(this.calc.poolSwapFee.toString());

    return _tokenInForExactTokenOut(
      balances,
      amp,
      0,
      tokenIndex,
      bptTotalSupply,
      swapFee
    );
  }

  public exactBPTInForTokenOut(
    bptAmount: string,
    tokenIndex: number
  ): FixedPointNumber {
    const tokenBalance = fnum(
      this.calc.poolTokenBalances[tokenIndex].toString()
    );
    const tokenNormalizedWeight = fnum(
      this.calc.poolTokenWeights[tokenIndex].toString()
    );
    const bptAmountIn = fnum(
      parseUnits(bptAmount, this.calc.poolDecimals).toString()
    );

    return _exactBPTInForTokenOut(
      tokenBalance,
      tokenNormalizedWeight,
      bptAmountIn,
      fnum(this.calc.poolTotalSupply.toString()),
      fnum(this.calc.poolSwapFee.toString())
    );
  }

  public bptForTokensZeroPriceImpact(tokenAmounts: string[]): BigNumber {
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => bnum(a.toString()));

    return _bptForTokensZeroPriceImpact(
      this.calc.poolTokenBalances.map(b => bnum(b.toString())),
      this.calc.poolTokenDecimals,
      this.calc.poolTokenWeights.map(w => bnum(w.toString())),
      amounts,
      bnum(this.calc.poolTotalSupply.toString())
    );
  }
}
