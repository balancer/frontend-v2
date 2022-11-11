import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { bptPriceFor } from '@/composables/usePool';
import { getTimestampSecondsFromNow } from '@/composables/useTime';
import { fetchPoolsForSor, hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { bnum, selectByAddress } from '@/lib/utils';
import { vaultService } from '@/services/contracts/vault.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, BatchSwap, SwapInfo } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
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
export class SwapExitHandler implements ExitPoolHandler {
  private lastSwapRoute?: SwapInfo;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {
    const userAddress = await params.signer.getAddress();
    await this.queryExit(params);
    if (!this.lastSwapRoute)
      throw new Error('Could not fetch swap route for join.');

    const swap = this.getSwapAttributes(
      this.lastSwapRoute,
      params.slippageBsp,
      userAddress
    );

    const { kind, swaps, assets, funds, limits } = swap.attributes as BatchSwap;
    return vaultService.batchSwap(
      kind,
      swaps,
      assets,
      funds,
      limits as string[]
    );
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
  private async queryOutGivenIn({
    bptIn,
    tokenInfo,
    amountsOut,
    prices,
  }: ExitParams): Promise<QueryOutput> {
    const amountIn = bptIn;
    const tokenIn = selectByAddress(tokenInfo, this.pool.value.address);
    const priceIn = bptPriceFor(this.pool.value);

    const tokenOut = tokenInfo[amountsOut[0].address];
    const priceOut = prices[tokenOut.address]?.usd;

    if (!tokenIn || !tokenOut)
      throw new Error('Missing critical token metadata.');
    if (!priceIn || !priceOut)
      throw new Error('Missing price for token to join with.');
    if (!amountIn || bnum(amountIn).eq(0))
      return { amountsOut: {}, priceImpact: 0 };

    if (!hasFetchedPoolsForSor) await fetchPoolsForSor();

    const safeAmountIn = overflowProtected(bptIn, tokenIn.decimals);
    const bnumAmountIn = parseFixed(safeAmountIn, tokenIn.decimals);
    const gasPrice = await this.getGasPrice();

    this.lastSwapRoute = await this.sdk.swaps.findRouteGivenIn({
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      amount: bnumAmountIn,
      gasPrice,
      maxPools: 4,
    });

    const amountOut = formatFixed(
      this.lastSwapRoute.returnAmountFromSwaps,
      tokenOut.decimals
    );
    if (bnum(amountOut).eq(0)) throw new Error('Not enough liquidity.');

    const fiatValueIn = bnum(priceIn).times(amountIn).toString();
    const fiatValueOut = bnum(priceOut).times(amountOut).toString();

    const priceImpact = this.calcPriceImpact(fiatValueIn, fiatValueOut);

    return { amountsOut: { [tokenOut.address]: amountOut }, priceImpact };
  }

  private async queryInGivenOut({
    tokenInfo,
    amountsOut,
    prices,
  }: ExitParams): Promise<QueryOutput> {
    const tokenIn = selectByAddress(tokenInfo, this.pool.value.address);
    const priceIn = bptPriceFor(this.pool.value);

    const amountOut = amountsOut[0].value;
    const tokenOut = tokenInfo[amountsOut[0].address];
    const priceOut = prices[tokenOut.address]?.usd;

    if (!tokenIn || !tokenOut)
      throw new Error('Missing critical token metadata.');
    if (!priceIn || !priceOut)
      throw new Error('Missing price for token to join with.');
    if (!amountOut || bnum(amountOut).eq(0))
      return { amountsOut: {}, priceImpact: 0 };

    if (!hasFetchedPoolsForSor) await fetchPoolsForSor();

    const safeAmountIn = overflowProtected(
      amountsOut[0].value,
      tokenOut.decimals
    );
    const bnumAmountIn = parseFixed(safeAmountIn, tokenOut.decimals);
    const gasPrice = await this.getGasPrice();

    this.lastSwapRoute = await this.sdk.swaps.findRouteGivenOut({
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      amount: bnumAmountIn,
      gasPrice,
      maxPools: 4,
    });

    const amountIn = formatFixed(
      this.lastSwapRoute.returnAmountFromSwaps,
      tokenOut.decimals
    );
    if (bnum(amountIn).eq(0)) throw new Error('Not enough liquidity.');

    const fiatValueIn = bnum(priceIn).times(amountIn).toString();
    const fiatValueOut = bnum(priceOut).times(amountOut).toString();

    const priceImpact = this.calcPriceImpact(fiatValueIn, fiatValueOut);

    return { amountsOut: { [tokenOut.address]: amountOut }, priceImpact };
  }

  private async getGasPrice(): Promise<BigNumber> {
    const gasPriceParams = await this.gasPriceService.getGasPrice();
    if (!gasPriceParams) throw new Error('Failed to fetch gas price.');

    return BigNumber.from(gasPriceParams.price);
  }

  private calcPriceImpact(fiatValueIn: string, fiatValueOut: string): number {
    const _fiatValueIn = bnum(fiatValueIn);
    const _fiatValueOut = bnum(fiatValueOut);

    // Don't return negative price impact
    return Math.max(
      0,
      _fiatValueIn
        .minus(_fiatValueOut)
        .div(_fiatValueIn.plus(_fiatValueOut).div(bnum(2)))
        .toNumber() || 1 // If fails to calculate return error value of 100%
    );
  }

  private getSwapAttributes(
    swapInfo: SwapInfo,
    maxSlippage: number,
    userAddress: string
  ) {
    const deadline = BigNumber.from(getTimestampSecondsFromNow(60)); // 60 seconds from now
    return this.sdk.swaps.buildSwap({
      userAddress,
      swapInfo,
      kind: 0,
      deadline,
      maxSlippage,
    });
  }
}
