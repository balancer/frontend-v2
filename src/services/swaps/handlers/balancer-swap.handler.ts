import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { getTimestampSecondsFromNow } from '@/composables/useTime';
import { POOLS } from '@/constants/pools';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { fetchPoolsForSor, hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { bnum, isSameAddress, selectByAddress } from '@/lib/utils';
import { vaultService } from '@/services/contracts/vault.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { BalancerSDK, BatchSwap, SwapInfo, SwapType } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import { JsonRpcSigner } from '@ethersproject/providers';
import { QueryOutput, SwapHandler, SwapParams } from './abstract-swap.handler';

/**
 * Handles exits for single asset flows where we need to use a BatchSwap to exit
 * the pool.
 */
export class BalancerSwapHandler implements SwapHandler {
  private lastSwap?: SwapInfo;

  constructor(
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async swap(params: SwapParams): Promise<TransactionResponse> {
    const userAddress = await params.signer.getAddress();
    await this.querySwap(params);
    if (!this.lastSwap) throw new Error('Could not fetch swap route for join.');

    const swap = this.getSwapAttributes(
      params.swapType,
      this.lastSwap,
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

  async querySwap(params: SwapParams): Promise<QueryOutput> {
    console.log('querySwap', params);
    if (params.swapType === SwapType.SwapExactIn) {
      return this.queryOutGivenIn(params);
    } else {
      return this.queryInGivenOut(params);
    }
  }

  /**
   * PRIVATE
   */

  /**
   * Get swap given tokenIn, this only used in exits when the user clicks to
   * maximize their withdrawal, i.e. we have to send their full BPT balance.
   */
  private async queryOutGivenIn({
    tokenIn,
    tokenOut,
    tokenData,
    signer,
  }: SwapParams): Promise<QueryOutput> {
    const tokenInData = selectByAddress(tokenData, tokenIn.address);
    const tokenOutData = selectByAddress(tokenData, tokenOut.address);

    if (!tokenInData || !tokenOutData)
      throw new Error('Missing critical token metadata.');
    if (!tokenIn.amount || bnum(tokenIn.amount).eq(0))
      return { returnAmount: '', priceImpact: 0 };

    // TODO: check if we need to fetch pools more than once.
    if (!hasFetchedPoolsForSor.value) await fetchPoolsForSor();

    const safeAmountIn = overflowProtected(
      tokenIn.amount,
      tokenInData.decimals
    );
    const evmAmountIn = parseFixed(safeAmountIn, tokenInData.decimals);
    const gasPrice = await this.getGasPrice(signer);

    this.lastSwap = await this.sdk.swaps.findRouteGivenIn({
      tokenIn: this.formatAddressForSor(tokenIn.address),
      tokenOut: this.formatAddressForSor(tokenOut.address),
      amount: evmAmountIn,
      gasPrice,
      maxPools: 4,
    });

    console.log('this.lastSwap', this.lastSwap);

    const returnAmount = formatFixed(
      this.lastSwap.returnAmount,
      tokenOutData.decimals
    );
    if (bnum(returnAmount).eq(0)) throw new Error('Not enough liquidity.');

    const priceImpact = this.calcPriceImpact(
      safeAmountIn,
      returnAmount,
      this.lastSwap.marketSp
    );

    return { returnAmount, priceImpact };
  }

  /**
   * Get swap given specified amount out.
   */
  private async queryInGivenOut({
    tokenIn,
    tokenOut,
    tokenData,
    signer,
  }: SwapParams): Promise<QueryOutput> {
    const tokenInData = selectByAddress(tokenData, tokenIn.address);
    const tokenOutData = selectByAddress(tokenData, tokenOut.address);

    if (!tokenInData || !tokenOutData)
      throw new Error('Missing critical token metadata.');

    if (!tokenOut.amount || bnum(tokenOut.amount).eq(0))
      return { returnAmount: '', priceImpact: 0 };

    if (!hasFetchedPoolsForSor.value) await fetchPoolsForSor();

    const safeAmountOut = overflowProtected(
      tokenOut.amount,
      tokenOutData.decimals
    );
    const evmAmountOut = parseFixed(safeAmountOut, tokenOutData.decimals);
    const gasPrice = await this.getGasPrice(signer);

    this.lastSwap = await this.sdk.swaps.findRouteGivenOut({
      tokenIn: this.formatAddressForSor(tokenIn.address),
      tokenOut: this.formatAddressForSor(tokenOut.address),
      amount: evmAmountOut,
      gasPrice,
      maxPools: 4,
    });

    const returnAmount = formatFixed(
      this.lastSwap.returnAmount,
      tokenInData.decimals
    );
    if (bnum(returnAmount).eq(0)) throw new Error('Not enough liquidity.');

    const priceImpact = this.calcPriceImpact(
      returnAmount,
      safeAmountOut,
      this.lastSwap.marketSp
    );

    return { returnAmount, priceImpact };
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
    kind: SwapType,
    swapInfo: SwapInfo,
    maxSlippage: number,
    userAddress: string
  ) {
    const deadline = BigNumber.from(getTimestampSecondsFromNow(60)); // 60 seconds from now

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
