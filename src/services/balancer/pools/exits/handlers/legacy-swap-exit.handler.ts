import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { getMinusSlippage } from '@/composables/useSlippage';

import { indexOfAddress, isSameAddress, selectByAddress } from '@/lib/utils';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { formatFixed } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { Ref } from 'vue';

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

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {
    console.log('params', params, 'pool', this.pool);
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

    const allPoolTokens: string[] = this.pool.value.tokens.map(
      token => token.address
    );

    const tokenIndex = indexOfAddress(allPoolTokens, tokenOut.address);
    this.pool.value.tokensList.findIndex(address =>
      isSameAddress(address, tokenOut.address)
    );
    await this.queryExit(params);

    // Set token amounts to 0
    const allPoolTokensAmounts = [...allPoolTokens.map(() => '0')];
    // Set the exit token amount to amountOut
    allPoolTokensAmounts[tokenIndex] = amountOut;

    if (!this.bptIn) throw new Error('Could not calculate bptIn.');
    console.log('parparp', [
      params.signer,
      allPoolTokensAmounts,
      allPoolTokens,
      this.bptIn,
      maxedOut ? tokenIndex : null,
      !maxedOut,
    ]);
    const tx = await params.poolExchange
      .exit(
        params.signer,
        allPoolTokensAmounts,
        allPoolTokens,
        this.bptIn,
        maxedOut ? tokenIndex : null,
        !maxedOut
      )
      .catch((error: Error) => {
        throw new Error(error.message);
      });
    return tx;
  }

  async queryExit(params: ExitParams): Promise<QueryOutput> {
    console.log('queryExit params', params);
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
    try {
      const maxOut = formatUnits(
        poolCalculator
          .exactBPTInForTokenOut(bptBalanceScaled, tokenIndex)
          .toString(),
        tokenOut.decimals
      );
      this.bptIn = bptIn;
      const result = {
        amountsOut: { [tokenOut.address]: maxOut },
        priceImpact: 0,
      };
      console.log({ queryOutGivenIn: result });
      return result;
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
    const tokenOutIndex = this.pool.value.tokensList.findIndex(address =>
      isSameAddress(address, tokenOut.address)
    );

    const safeAmountOut = overflowProtected(
      amountsOut[0].value,
      tokenOut.decimals
    );

    this.bptIn = poolCalculator
      .bptInForExactTokenOut(safeAmountOut, tokenOutIndex)
      .toString();
    // Not needed
    const amountIn = formatFixed(this.bptIn, tokenIn.decimals);

    const result = {
      amountIn,
      amountsOut: { [tokenOut.address]: amountOut },
      priceImpact: 0,
    };
    console.log({ queryInGivenOut: result });
    return result;
  }
}
