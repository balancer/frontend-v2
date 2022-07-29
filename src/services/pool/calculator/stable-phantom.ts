import { phantomStableBPTForTokensZeroPriceImpact as _bptForTokensZeroPriceImpact } from '@balancer-labs/sdk';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import OldBigNumber from 'bignumber.js';

import { bnum } from '@/lib/utils';

import Calculator from './calculator.sevice';
import { PiOptions } from './calculator.sevice';

export default class StablePhantom {
  calc: Calculator;
  AMP_PRECISION = bnum(1000);

  constructor(calculator) {
    this.calc = calculator;
  }

  public priceImpact(tokenAmounts: string[], opts: PiOptions): OldBigNumber {
    if (!opts.queryBPT)
      throw new Error('Need query BPT to calc StablePhantom Price Impact');

    console.log('Query BPT:', opts.queryBPT);
    let bptAmount: OldBigNumber | BigNumberish;
    let bptZeroPriceImpact: OldBigNumber;

    if (this.calc.action === 'join') {
      bptAmount = bnum(opts.queryBPT);
      if (bptAmount.isLessThan(0)) return bnum(0);
      bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts);

      return bnum(1).minus(bptAmount.div(bptZeroPriceImpact));
    } else {
      // Single asset exit
      if (opts.exactOut) {
        bptAmount = bnum(opts.queryBPT);
        bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts);
      } else {
        // Single asset max out case
        bptAmount = parseUnits(
          this.calc.bptBalance,
          this.calc.poolDecimals
        ).toString();
        bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts);
      }

      return bnum(bptAmount).div(bptZeroPriceImpact).minus(1);
    }
  }

  /**
   * PRIVATE FUNCTIONS
   */
  private bptForTokensZeroPriceImpact(tokenAmounts: string[]): OldBigNumber {
    const amp = bnum(this.calc.pool.value?.onchain?.amp?.toString() || '0');
    const ampAdjusted = BigNumber.from(this.adjustAmp(amp).toString());
    const denormAmounts = this.calc.denormAmounts(
      tokenAmounts,
      this.calc.poolTokenDecimals
    );
    // This function should use pool balances (i.e. without rate conversion)
    const bptZeroImpact = _bptForTokensZeroPriceImpact(
      this.calc.poolTokenBalances,
      this.calc.poolTokenDecimals,
      denormAmounts,
      this.calc.poolTotalSupply,
      ampAdjusted,
      this.calc.poolSwapFee,
      this.priceRates
    );

    console.log('bptZeroImpact', bptZeroImpact.toString());

    return bnum(bptZeroImpact.toString());
  }

  private get scaledBalances(): BigNumber[] {
    return this.calc.poolTokenBalances.map((balance, i) => {
      const normalizedBalance = formatUnits(
        balance,
        this.calc.poolTokenDecimals[i]
      );
      const scaledBalance = this.scaleInput(
        normalizedBalance,
        this.calc.pool.value.tokens[i].priceRate
      );
      return scaledBalance;
    });
  }

  private scaleInput(
    normalizedAmount: string,
    priceRate: string | null = null
  ): BigNumber {
    if (priceRate === null) priceRate = '1';

    const denormAmount = bnum(parseUnits(normalizedAmount, 18).toString())
      .times(priceRate)
      .toFixed(0, OldBigNumber.ROUND_UP);

    return BigNumber.from(denormAmount);
  }

  // Solidity maths uses precison method for amp that must be replicated
  private adjustAmp(amp: OldBigNumber): OldBigNumber {
    return amp.times(this.AMP_PRECISION);
  }

  private get priceRates(): BigNumberish[] {
    const tokenRates = this.calc.pool.value?.onchain?.tokenRates;
    if (!tokenRates) return [];
    return tokenRates.map(rate => parseUnits(rate, 18));
  }
}
