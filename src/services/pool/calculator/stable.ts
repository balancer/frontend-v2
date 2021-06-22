import Calculator from './calculator.sevice';
import { PiOptions } from './calculator.sevice';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { bnum } from '@/lib/utils';
import BigNumber from 'bignumber.js';

import {
  _exactTokensInForBPTOut,
  _exactBPTInForTokenOut,
  _bptInForExactTokensOut
} from '@balancer-labs/sor2/dist/pools/stablePool/stableMathEvm';
import { BPTForTokensZeroPriceImpact as _bptForTokensZeroPriceImpact } from '@balancer-labs/sor2/dist/frontendHelpers/stableHelpers';
import { fnum } from '@balancer-labs/sor2/dist/math/lib/fixedPoint';
import { FixedPointNumber } from '@balancer-labs/sor2/dist/math/FixedPointNumber';
import { BigNumberish } from '@ethersproject/bignumber';

/**
 * The stableMathEvm works with all values scaled to 18 decimals,
 * all inputs should be scaled appropriately.
 */
export default class Stable {
  calc: Calculator;

  constructor(calculator) {
    this.calc = calculator;
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

    return this.scaleOutput(
      bptOut.toString(),
      this.calc.poolDecimals,
      BigNumber.ROUND_DOWN // If OUT given IN, round down
    );
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

    return this.scaleOutput(
      bptIn.toString(),
      this.calc.poolDecimals,
      BigNumber.ROUND_UP // If IN given OUT, round up
    );
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

    return this.scaleOutput(
      bptIn.toString(),
      this.calc.poolDecimals,
      BigNumber.ROUND_UP // If IN given OUT, round up
    );
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

    return this.scaleOutput(
      tokenAmountOut.toString(),
      this.calc.poolTokenDecimals[tokenIndex],
      BigNumber.ROUND_DOWN // If OUT given IN, round down
    );
  }

  public priceImpact(tokenAmounts: string[], opts: PiOptions): BigNumber {
    let bptAmount: FixedPointNumber | BigNumberish;
    let bptZeroPriceImpact: BigNumber;

    if (this.calc.action === 'join') {
      bptAmount = this.exactTokensInForBPTOut(tokenAmounts);
      if (bptAmount.isLessThan(0)) return bnum(0);
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

  // PRIVATE FUNCTIONS

  private bptForTokensZeroPriceImpact(tokenAmounts: string[]): BigNumber {
    const amp = fnum(this.calc.pool.onchain.amp?.toString() || '0');
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => bnum(a.toString()));
    const balances = this.calc.poolTokenBalances.map(b => bnum(b.toString()));

    return _bptForTokensZeroPriceImpact(
      balances,
      this.calc.poolTokenDecimals,
      amounts,
      bnum(this.calc.poolTotalSupply.toString()),
      amp
    );
  }

  private get scaledBalances(): FixedPointNumber[] {
    return this.calc.poolTokenBalances.map((balance, i) => {
      const normalizedBalance = formatUnits(
        balance,
        this.calc.poolTokenDecimals[i]
      );
      const scaledBalance = parseUnits(normalizedBalance, 18);
      return fnum(scaledBalance.toString());
    });
  }

  private get scaledPoolTotalSupply(): FixedPointNumber {
    const normalizedSupply = formatUnits(
      this.calc.poolTotalSupply,
      this.calc.poolDecimals
    );
    const scaledSupply = parseUnits(normalizedSupply, 18);
    return fnum(scaledSupply.toString());
  }

  private scaleOutput(
    amount: string,
    decimals: number,
    rounding: BigNumber.RoundingMode
  ): FixedPointNumber {
    const normalizedAmount = bnum(formatUnits(amount, 18)).toFixed(
      decimals,
      rounding
    );
    const scaledAmount = parseUnits(normalizedAmount, decimals);

    return fnum(scaledAmount.toString());
  }
}
