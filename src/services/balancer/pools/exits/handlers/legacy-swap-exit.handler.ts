import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { getMinusSlippage } from '@/composables/useSlippage';

import { indexOfAddress, isSameAddress, selectByAddress } from '@/lib/utils';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { Ref } from 'vue';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';

import {
  ExitParams,
  ExitPoolHandler,
  ExitType,
  QueryOutput,
} from './exit-pool.handler';

/**
 * Handles exits for single asset flows where we need to use a BatchSwap to exit
 * the pool.
 */
export class LegacySwapExitHandler implements ExitPoolHandler {
  private bptIn?: string;
  private allPoolTokens: string[];

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {
    this.allPoolTokens = this.pool.value.tokens.map(token => token.address);
  }

  async exit(params: ExitParams): Promise<TransactionResponse> {
    const maxedOut: boolean = params.exitType === ExitType.GivenIn;
    const tokenOut = selectByAddress(
      params.tokenInfo,
      params.amountsOut[0].address
    );

    if (!tokenOut) {
      throw new Error('Could not find exit token in pool tokens list.');
    }

    const amountOut = maxedOut
      ? // If maxed out, we need to subtract the slippage from the amount
        getMinusSlippage(
          params.amountsOut[0].value,
          tokenOut.decimals,
          params.slippageBsp
        )
      : params.amountsOut[0].value;

    const tokenOutIndex = indexOfAddress(this.allPoolTokens, tokenOut.address);
    this.pool.value.tokensList.findIndex(address =>
      isSameAddress(address, tokenOut.address)
    );
    await this.queryExit(params);

    if (!this.bptIn) throw new Error('Could not calculate bptIn.');

    const fullAmounts = this.getFullAmounts(
      this.allPoolTokens,
      tokenOutIndex,
      amountOut
    );

    const tx = await params.poolExchange
      .exit(
        params.signer,
        fullAmounts,
        this.allPoolTokens,
        this.bptIn,
        maxedOut ? tokenOutIndex : null,
        !maxedOut
      )
      .catch((error: Error) => {
        throw new Error(error.message);
      });
    return tx;
  }

  async queryExit(params: ExitParams): Promise<QueryOutput> {
    if (params.exitType === ExitType.GivenIn) {
      return this.queryOutGivenIn(params);
    } else {
      return this.queryInGivenOut(params);
    }
  }

  /**
   * PRIVATE
   */

  /**
   * Get swap given bptIn, this only used in exits when the user clicks to
   * maximize their withdrawal, i.e. we have to send their full BPT balance.
   */
  private async queryOutGivenIn({
    bptIn,
    tokenInfo,
    amountsOut,
    // signer,
    poolCalculator,
  }: ExitParams): Promise<QueryOutput> {
    const bptBalanceScaled = parseUnits(
      bptIn,
      this.pool.value.onchain?.decimals || 18
    ).toString();
    const tokenOut = selectByAddress(tokenInfo, amountsOut[0].address);
    if (!tokenOut)
      throw new Error('Could not find exit token in pool tokens list.');
    const tokenIndex = this.pool.value.tokensList.findIndex(address =>
      isSameAddress(address, tokenOut.address)
    );

    let maxOut: string;
    try {
      maxOut = formatUnits(
        poolCalculator
          .exactBPTInForTokenOut(bptBalanceScaled, tokenIndex)
          .toString(),
        tokenOut.decimals
      );
    } catch (error) {
      throw new Error('SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT');
      // TODO: Handle this error
      // if ((error as Error).message.includes('MIN_BPT_IN_FOR_TOKEN_OUT')) {
      //   setError(WithdrawalError.SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT);
      //   return poolTokens.value.map((token, tokenIndex) => {
      //     return formatUnits(
      //       poolCalculator
      //         .exactBPTInForTokenOut(
      //           parseUnits(absMaxBpt.value, poolDecimals.value).toString(),
      //           tokenIndex
      //         )
      //         .toString(),
      //       token.decimals
      //     );
      //   });
      // }
    }

    const tokenOutIndex = indexOfAddress(this.allPoolTokens, tokenOut.address);
    const amountOut = amountsOut[0].value || '0';
    const fullAmounts = this.getFullAmounts(
      this.allPoolTokens,
      tokenOutIndex,
      amountOut
    );
    this.bptIn = bptIn;

    const priceImpact = this.getPriceImpact({
      poolCalculator,
      fullAmounts,
      exactOut: true,
      tokenOutIndex,
      fullBPTIn: this.bptIn,
    });
    const result = {
      amountsOut: { [tokenOut.address]: maxOut },
      priceImpact,
    };

    return result;
  }

  /**
   * Get swap given specified amount out.
   */
  private async queryInGivenOut({
    // bptIn,
    tokenInfo,
    amountsOut,
    // signer,
    poolCalculator,
  }: ExitParams): Promise<QueryOutput> {
    const tokenIn = selectByAddress(tokenInfo, this.pool.value.address);
    const tokenOut = selectByAddress(tokenInfo, amountsOut[0].address);
    if (!tokenOut || !tokenIn)
      throw new Error('Missing critical token metadata.');

    const amountOut = amountsOut[0].value;
    const tokenOutIndex = indexOfAddress(this.allPoolTokens, tokenOut.address);

    const safeAmountOut = overflowProtected(
      amountsOut[0].value,
      tokenOut.decimals
    );

    this.bptIn = poolCalculator
      .bptInForExactTokenOut(safeAmountOut, tokenOutIndex)
      .toString();

    const fullAmounts = this.getFullAmounts(
      this.allPoolTokens,
      tokenOutIndex,
      amountOut
    );

    const priceImpact = this.getPriceImpact({
      poolCalculator,
      fullAmounts,
      exactOut: true,
      tokenOutIndex,
      fullBPTIn: this.bptIn,
    });
    const result = {
      amountsOut: { [tokenOut.address]: amountOut },
      priceImpact,
    };

    return result;
  }

  private getPriceImpact({
    poolCalculator,
    fullAmounts,
    exactOut,
    tokenOutIndex,
    fullBPTIn,
  }: {
    poolCalculator: PoolCalculator;
    fullAmounts: string[];
    exactOut: boolean;
    tokenOutIndex: number;
    fullBPTIn: string;
  }): number {
    return poolCalculator
      .priceImpact(fullAmounts, {
        exactOut: exactOut,
        tokenIndex: tokenOutIndex,
        queryBPT: fullBPTIn,
      })
      .toNumber();
  }

  private getFullAmounts(
    poolTokens: string[],
    tokenOutIndex: number,
    tokenOutAmount: string
  ): string[] {
    // Set token amounts to 0
    const allPoolTokensAmounts = poolTokens.map(() => '0');
    // Set the exit token amount to tokenOutAmount
    allPoolTokensAmounts[tokenOutIndex] = tokenOutAmount;
    return allPoolTokensAmounts;
  }
}
