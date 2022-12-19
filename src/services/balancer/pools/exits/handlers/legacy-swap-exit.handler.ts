import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { getTimestampSecondsFromNow } from '@/composables/useTime';
import { POOLS } from '@/constants/pools';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';

import { bnum, isSameAddress, selectByAddress } from '@/lib/utils';
import { vaultService } from '@/services/contracts/vault.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, BatchSwap, SwapInfo, SwapType } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcSigner } from '@ethersproject/providers';
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
    const tokenOut = selectByAddress(tokenInfo, amountsOut[0].address);
    if (!tokenOut)
      throw new Error('Could not find exit token in pool tokens list.');
    const tokenOutIndex = this.pool.value.tokensList.findIndex(address =>
      isSameAddress(address, tokenOut.address)
    );

    const safeAmountOut = overflowProtected(
      amountsOut[0].value,
      tokenOut.decimals
    );

    const amountOut = poolCalculator
      .bptInForExactTokenOut(safeAmountOut, tokenOutIndex)
      .toString();

    const result = {
      amountsOut: { [tokenOut.address]: amountOut },
      priceImpact: 0,
    };
    console.log({ queryInGivenOut: result });
    return result;
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
