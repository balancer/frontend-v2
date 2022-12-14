import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { getTimestampSecondsFromNow } from '@/composables/useTime';
import { POOLS } from '@/constants/pools';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { fetchPoolsForSor, hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { bnum, isSameAddress } from '@/lib/utils';
import { AmountIn } from '@/providers/local/join-pool.provider';
import { vaultService } from '@/services/contracts/vault.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, BatchSwap, SwapInfo } from '@balancer-labs/sdk';
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import { JsonRpcSigner } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import { Ref } from 'vue';
import { JoinParams, JoinPoolHandler, QueryOutput } from './join-pool.handler';

/**
 * Handles joins for single asset flows where we need to use a BatchSwap to join
 * the pool.
 */
export class SwapJoinHandler implements JoinPoolHandler {
  private lastSwapRoute?: SwapInfo;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async join(params: JoinParams): Promise<TransactionResponse> {
    const { signer, slippageBsp } = params;
    const userAddress = await signer.getAddress();
    await this.queryJoin(params);
    if (!this.lastSwapRoute)
      throw new Error('Could not fetch swap route for join.');

    const swap = this.getSwapAttributes(
      this.lastSwapRoute,
      slippageBsp,
      userAddress
    );
    const options = this.getSwapOptions(params.amountsIn[0]);

    const { kind, swaps, assets, funds, limits } = swap.attributes as BatchSwap;
    return vaultService.batchSwap(
      kind,
      swaps,
      assets,
      funds,
      limits as string[],
      options
    );
  }

  async queryJoin({
    amountsIn,
    tokensIn,
    signer,
  }: JoinParams): Promise<QueryOutput> {
    if (amountsIn.length === 0)
      throw new Error('Missing amounts to join with.');

    const amountIn = amountsIn[0];
    const tokenIn = tokensIn[amountIn.address];
    if (!tokenIn) throw new Error('Missing critical token metadata.');
    if (!amountIn.value || bnum(amountIn.value).eq(0))
      return { bptOut: '0', priceImpact: 0 };

    if (!hasFetchedPoolsForSor.value) await fetchPoolsForSor();

    const safeAmount = overflowProtected(amountIn.value, tokenIn.decimals);
    const bnumAmount = parseFixed(safeAmount, tokenIn.decimals);
    const gasPrice = await this.getGasPrice(signer);

    this.lastSwapRoute = await this.sdk.swaps.findRouteGivenIn({
      tokenIn: this.formatAddressForSor(amountIn.address),
      tokenOut: this.pool.value.address,
      amount: bnumAmount,
      gasPrice,
      maxPools: 4,
    });

    const bptOut = formatFixed(
      this.lastSwapRoute.returnAmount,
      this.pool.value.onchain?.decimals || 18
    );
    if (bnum(bptOut).eq(0)) throw new Error('Not enough liquidity.');

    const priceImpact = this.calcPriceImpact(
      amountIn.value,
      bptOut,
      this.lastSwapRoute.marketSp
    );

    return { bptOut, priceImpact };
  }

  /**
   * PRIVATE
   */
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

  private getSwapOptions(amountIn: AmountIn): TransactionRequest {
    const options: TransactionRequest = {};

    if (isSameAddress(amountIn.address, NATIVE_ASSET_ADDRESS))
      options.value = parseUnits(amountIn.value).toString();

    return options;
  }

  private formatAddressForSor(address: string): string {
    return isSameAddress(address, NATIVE_ASSET_ADDRESS)
      ? POOLS.ZeroAddress
      : address;
  }
}
