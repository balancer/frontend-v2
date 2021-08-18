import Calculator from './calculator.sevice';
import { PiOptions } from './calculator.sevice';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { bnum } from '@/lib/utils';
import BigNumber from 'bignumber.js';

import { BPTForTokensZeroPriceImpact as _bptForTokensZeroPriceImpact } from '@balancer-labs/sor2/dist/frontendHelpers/stableHelpers';
import { BigNumberish } from '@ethersproject/bignumber';
import * as SDK from '@georgeroman/balancer-v2-pools';

/**
 * The stableMathEvm works with all values scaled to 18 decimals,
 * all inputs should be scaled appropriately.
 */
export default class Stable {
  calc: Calculator;
  AMP_PRECISION = bnum(1000);

  constructor(calculator) {
    this.calc = calculator;
  }

  public exactTokensInForBPTOut(tokenAmounts: string[]): BigNumber {
    const amp = bnum(this.calc.pool.onchain.amp?.toString() || '0');
    const ampAdjusted = this.adjustAmp(amp);
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals.map(() => 18)
    );
    const amounts = denormAmounts.map(a => bnum(a.toString()));

    const bptOut = SDK.StableMath._calcBptOutGivenExactTokensIn(
      ampAdjusted,
      this.scaledBalances,
      amounts,
      this.scaledPoolTotalSupply,
      bnum(this.calc.poolSwapFee.toString())
    );

    return this.scaleOutput(
      bptOut.toString(),
      this.calc.poolDecimals,
      BigNumber.ROUND_DOWN // If OUT given IN, round down
    );
  }

  public bptInForExactTokensOut(tokenAmounts: string[]): BigNumber {
    const amp = bnum(this.calc.pool.onchain.amp?.toString() || '0');
    const ampAdjusted = this.adjustAmp(amp);

    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals.map(() => 18)
    );
    const amounts = denormAmounts.map(a => bnum(a.toString()));

    const bptIn = SDK.StableMath._calcBptInGivenExactTokensOut(
      ampAdjusted,
      this.scaledBalances,
      amounts,
      this.scaledPoolTotalSupply,
      bnum(this.calc.poolSwapFee.toString())
    );

    return this.scaleOutput(
      bptIn.toString(),
      this.calc.poolDecimals,
      BigNumber.ROUND_UP // If IN given OUT, round up
    );
  }

  public bptInForExactTokenOut(amount: string, tokenIndex: number): BigNumber {
    const amp = bnum(this.calc.pool.onchain.amp?.toString() || '0');
    const ampAdjusted = this.adjustAmp(amp);
    const amounts = this.calc.pool.tokenAddresses.map((address, i) => {
      if (i === tokenIndex) return bnum(parseUnits(amount, 18).toString());
      return bnum('0');
    });

    const bptIn = SDK.StableMath._calcBptInGivenExactTokensOut(
      ampAdjusted,
      this.scaledBalances,
      amounts,
      this.scaledPoolTotalSupply,
      bnum(this.calc.poolSwapFee.toString())
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
  ): BigNumber {
    if (bnum(bptAmount).eq(0))
      return this.scaleOutput(
        '0',
        this.calc.poolTokenDecimals[tokenIndex],
        BigNumber.ROUND_DOWN // If OUT given IN, round down
      );

    const amp = bnum(this.calc.pool.onchain.amp?.toString() || '0');
    const ampAdjusted = this.adjustAmp(amp);
    const bptAmountIn = bnum(parseUnits(bptAmount, 18).toString());

    const tokenAmountOut = SDK.StableMath._calcTokenOutGivenExactBptIn(
      ampAdjusted,
      this.scaledBalances,
      tokenIndex,
      bptAmountIn,
      this.scaledPoolTotalSupply,
      bnum(this.calc.poolSwapFee.toString())
    );

    return this.scaleOutput(
      tokenAmountOut.toString(),
      this.calc.poolTokenDecimals[tokenIndex],
      BigNumber.ROUND_DOWN // If OUT given IN, round down
    );
  }

  public priceImpact(tokenAmounts: string[], opts: PiOptions): BigNumber {
    let bptAmount: BigNumber | BigNumberish;
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

  /**
   * PRIVATE FUNCTIONS
   */
  private bptForTokensZeroPriceImpact(tokenAmounts: string[]): BigNumber {
    const amp = bnum(this.calc.pool.onchain.amp?.toString() || '0');
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => bnum(a.toString()));

    const balances = this.scaledBalances.map((balance, i) => {
      const normalizedBalance = formatUnits(balance.toString(), 18);
      const denormBalance = parseUnits(
        normalizedBalance,
        this.calc.poolTokenDecimals[i]
      );
      return bnum(denormBalance.toString());
    });

    const bptZeroImpact = _bptForTokensZeroPriceImpact(
      balances,
      this.calc.poolTokenDecimals,
      amounts,
      bnum(this.calc.poolTotalSupply.toString()),
      amp
    );

    return bptZeroImpact;
  }

  private get scaledBalances(): BigNumber[] {
    return this.calc.poolTokenBalances.map((balance, i) => {
      const normalizedBalance = formatUnits(
        balance,
        this.calc.poolTokenDecimals[i]
      );
      const scaledBalance = parseUnits(normalizedBalance, 18)
        .mul(parseUnits(this.calc.pool.tokens[i].priceRate ?? '1', 18))
        .div(parseUnits('1', 18));
      return bnum(scaledBalance.toString());
    });
  }

  private get scaledPoolTotalSupply(): BigNumber {
    const normalizedSupply = formatUnits(
      this.calc.poolTotalSupply,
      this.calc.poolDecimals
    );
    const scaledSupply = parseUnits(normalizedSupply, 18);
    return bnum(scaledSupply.toString());
  }

  private scaleOutput(
    amount: string,
    decimals: number,
    rounding: BigNumber.RoundingMode
  ): BigNumber {
    const normalizedAmount = bnum(formatUnits(amount, 18)).toFixed(
      decimals,
      rounding
    );
    const scaledAmount = parseUnits(normalizedAmount, decimals);

    return bnum(scaledAmount.toString());
  }

  // Solidity maths uses precison method for amp that must be replicated
  private adjustAmp(amp: BigNumber): BigNumber {
    return amp.times(this.AMP_PRECISION);
  }
}
