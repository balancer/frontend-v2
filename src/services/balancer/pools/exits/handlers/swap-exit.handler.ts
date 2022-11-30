import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { getTimestampSecondsFromNow } from '@/composables/useTime';
import { POOLS } from '@/constants/pools';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { fetchPoolsForSor, hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { bnum, isSameAddress, selectByAddress } from '@/lib/utils';
import { vaultService } from '@/services/contracts/vault.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, BatchSwap, SwapInfo, SwapType } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import { JsonRpcSigner } from '@ethersproject/providers';
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
      params.exitType,
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

  /**
   * Get swap given bptIn, this only used in exits when the user clicks to
   * maximize their withdrawal, i.e. we have to send their full BPT balance.
   */
  private async queryOutGivenIn({
    bptIn,
    tokenInfo,
    amountsOut,
    signer,
  }: ExitParams): Promise<QueryOutput> {
    const amountIn = bptIn;
    const tokenIn = selectByAddress(tokenInfo, this.pool.value.address);

    const tokenOut = tokenInfo[amountsOut[0].address];

    if (!tokenIn || !tokenOut)
      throw new Error('Missing critical token metadata.');
    if (!amountIn || bnum(amountIn).eq(0))
      return { amountsOut: { [tokenOut.address]: '0' }, priceImpact: 0 };

    if (!hasFetchedPoolsForSor.value) await fetchPoolsForSor();

    const safeAmountIn = overflowProtected(bptIn, tokenIn.decimals);
    const bnumAmountIn = parseFixed(safeAmountIn, tokenIn.decimals);
    const gasPrice = await this.getGasPrice(signer);

    this.lastSwapRoute = await this.sdk.swaps.findRouteGivenIn({
      tokenIn: tokenIn.address,
      tokenOut: this.formatAddressForSor(tokenOut.address),
      amount: bnumAmountIn,
      gasPrice,
      maxPools: 4,
    });

    const amountOut = formatFixed(
      this.lastSwapRoute.returnAmount,
      tokenOut.decimals
    );
    if (bnum(amountOut).eq(0)) throw new Error('Not enough liquidity.');

    const priceImpact = this.calcPriceImpact(
      amountIn,
      amountOut,
      this.lastSwapRoute.marketSp
    );

    return { amountsOut: { [tokenOut.address]: amountOut }, priceImpact };
  }

  /**
   * Get swap given specified amount out.
   */
  private async queryInGivenOut({
    tokenInfo,
    amountsOut,
    signer,
  }: ExitParams): Promise<QueryOutput> {
    const tokenIn = selectByAddress(tokenInfo, this.pool.value.address);
    const tokenOut = selectByAddress(tokenInfo, amountsOut[0].address);
    if (!tokenIn || !tokenOut)
      throw new Error('Missing critical token metadata.');

    const amountOut = amountsOut[0].value;
    if (!amountOut || bnum(amountOut).eq(0))
      return { amountsOut: {}, priceImpact: 0 };

    if (!hasFetchedPoolsForSor.value) await fetchPoolsForSor();

    const safeAmountOut = overflowProtected(
      amountsOut[0].value,
      tokenOut.decimals
    );
    const bnumAmountOut = parseFixed(safeAmountOut, tokenOut.decimals);
    const gasPrice = await this.getGasPrice(signer);

    this.lastSwapRoute = await this.sdk.swaps.findRouteGivenOut({
      tokenIn: tokenIn.address,
      tokenOut: this.formatAddressForSor(tokenOut.address),
      amount: bnumAmountOut,
      gasPrice,
      maxPools: 4,
    });

    const amountIn = formatFixed(
      this.lastSwapRoute.returnAmount,
      tokenIn.decimals
    );
    if (bnum(amountIn).eq(0)) throw new Error('Not enough liquidity.');

    const priceImpact = this.calcPriceImpact(
      amountIn,
      amountOut,
      this.lastSwapRoute.marketSp
    );

    return { amountsOut: { [tokenOut.address]: amountOut }, priceImpact };
  }

  private async getGasPrice(signer: JsonRpcSigner): Promise<BigNumber> {
    let price: number;

    const gasPriceParams = await this.gasPriceService.getGasPrice();
    if (gasPriceParams) {
      price = gasPriceParams.price;
    } else {
      price = (await signer.getGasPrice()).toNumber();
    }

    if (!price) throw new Error('Failed to fetch gas price.');

    return BigNumber.from(price);
  }

  private calcPriceImpact(
    amountIn: string,
    amountOut: string,
    marketSp: string
  ): number {
    const effectivePrice = bnum(amountIn).div(amountOut);
    const priceImpact = effectivePrice.div(marketSp).minus(1) || 1; // If fails to calculate return error value of 100%

    // Don't return negative price impact
    return Math.max(0, priceImpact.toNumber());
  }

  private getSwapAttributes(
    exitType: ExitType,
    swapInfo: SwapInfo,
    maxSlippage: number,
    userAddress: string
  ) {
    const deadline = BigNumber.from(getTimestampSecondsFromNow(60)); // 60 seconds from now
    const kind =
      exitType === ExitType.GivenIn
        ? SwapType.SwapExactIn
        : SwapType.SwapExactOut;

    return this.sdk.swaps.buildSwap({
      userAddress,
      swapInfo,
      kind,
      deadline,
      maxSlippage,
    });
  }

  private formatAddressForSor(address: string): string {
    return isSameAddress(address, NATIVE_ASSET_ADDRESS)
      ? POOLS.ZeroAddress
      : address;
  }
}
