import Calculator from './calculator.sevice';
import { PiOptions } from './calculator.sevice';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { bnum, scale, scaleFp } from '@/lib/utils';
import BigNumber from 'bignumber.js';

import {
  _exactTokensInForBPTOut,
  _exactBPTInForTokenOut,
  _bptInForExactTokensOut
} from '@balancer-labs/sor2/dist/pools/stablePool/stableMathEvm';
import { BPTForTokensZeroPriceImpact as _bptForTokensZeroPriceImpact } from '@balancer-labs/sor2/dist/frontendHelpers/stableHelpers';
import { fnum } from '@balancer-labs/sor2/dist/math/lib/fixedPoint';
import { FixedPointNumber } from '@balancer-labs/sor2/dist/math/FixedPointNumber';

/**
 * The stableMathEvm works with all values scaled to 18 decimals,
 * all inputs should be scaled appropriately.
 */
export default class Stable {
  calc: Calculator;

  constructor(calculator) {
    this.calc = calculator;
  }

  public get scaledBalances(): FixedPointNumber[] {
    return this.calc.poolTokenBalances.map((balance, i) => {
      const normalizedBalance = formatUnits(
        balance,
        this.calc.poolTokenDecimals[i]
      );
      const scaledBalance = parseUnits(normalizedBalance, 18);
      return fnum(scaledBalance.toString());
    });
  }

  public get scaledPoolTotalSupply(): FixedPointNumber {
    const normalizedSupply = formatUnits(
      this.calc.poolTotalSupply,
      this.calc.poolDecimals
    );
    const scaledSupply = parseUnits(normalizedSupply, 18);
    return fnum(scaledSupply.toString());
  }

  public exactTokensInForBPTOut(tokenAmounts: string[]): FixedPointNumber {
    const amp = fnum(this.calc.pool.onchain.amp?.toString() || '0');
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals.map(() => 18)
    );
    const amounts = denormAmounts.map(a => fnum(a.toString()));

    const bptOut = _exactTokensInForBPTOut(
      this.scaledBalances,
      amp,
      amounts,
      this.scaledPoolTotalSupply,
      fnum(this.calc.poolSwapFee.toString())
    );

    return scaleFp(bptOut, this.calc.poolDecimals - 18);
  }

  public bptInForExactTokensOut(tokenAmounts: string[]): FixedPointNumber {
    const amp = fnum(this.calc.pool.onchain.amp?.toString() || '0');
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals.map(() => 18)
    );
    const amounts = denormAmounts.map(a => fnum(a.toString()));

    const bptIn = _bptInForExactTokensOut(
      this.scaledBalances,
      amp,
      amounts,
      this.scaledPoolTotalSupply,
      fnum(this.calc.poolSwapFee.toString())
    );

    return scaleFp(bptIn, this.calc.poolDecimals - 18);
  }

  public bptInForExactTokenOut(
    amount: string,
    tokenIndex: number
  ): FixedPointNumber {
    const amp = fnum(this.calc.pool.onchain.amp?.toString() || '0');
    const amounts = this.calc.pool.tokenAddresses.map((address, i) => {
      if (i === tokenIndex) return fnum(parseUnits(amount, 18).toString());
      return fnum('0');
    });

    const bptIn = _bptInForExactTokensOut(
      this.scaledBalances,
      amp,
      amounts,
      this.scaledPoolTotalSupply,
      fnum(this.calc.poolSwapFee.toString())
    );

    return scaleFp(bptIn, this.calc.poolDecimals - 18);
  }

  public exactBPTInForTokenOut(
    bptAmount: string,
    tokenIndex: number
  ): FixedPointNumber {
    const amp = fnum(this.calc.pool.onchain.amp?.toString() || '0');
    const bptAmountIn = fnum(parseUnits(bptAmount, 18).toString());

    const tokenAmountOut = _exactBPTInForTokenOut(
      tokenIndex,
      this.scaledBalances,
      amp,
      bptAmountIn,
      this.scaledPoolTotalSupply,
      fnum(this.calc.poolSwapFee.toString())
    );

    const normalizedAmount = bnum(
      formatUnits(tokenAmountOut.toString(), 18)
    ).toFixed(this.calc.poolTokenDecimals[tokenIndex], BigNumber.ROUND_DOWN);
    const scaledAmount = parseUnits(
      normalizedAmount,
      this.calc.poolTokenDecimals[tokenIndex]
    );

    return fnum(scaledAmount.toString());
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

  public bptForTokensZeroPriceImpact(tokenAmounts: string[]): BigNumber {
    const amp = fnum(this.calc.pool.onchain.amp?.toString() || '0');
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => bnum(a.toString()));

    return _bptForTokensZeroPriceImpact(
      this.calc.poolTokenBalances.map(b => bnum(b.toString())),
      this.calc.poolTokenDecimals,
      amounts,
      bnum(this.calc.poolTotalSupply.toString()),
      amp
    );
  }
}
