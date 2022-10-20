import { balancer } from '@/lib/balancer.sdk';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, BatchSwap, SwapInfo } from '@balancer-labs/sdk';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import { gasPriceService } from '@/services/gas-price/gas-price.service';
import useWeb3 from '@/services/web3/useWeb3';
import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { bnum } from '@/lib/utils';
import useNumbers from '@/composables/useNumbers';
import { vaultService } from '@/services/contracts/vault.service';
import { TransactionResponse } from '@ethersproject/abstract-provider';

interface JoinPoolReturnValue {
  route: SwapInfo;
  fiatValueOut: string;
  bptOut: string;
  priceImpact: number;
  priceImpactFiat: string;
}

export default class JoinPool {
  poolId: string;
  poolAddress: string;
  balancer: BalancerSDK;
  hasFetchedPools: boolean;
  swapRouteLoading: boolean;
  bptDecimals: number;
  constructor(poolId: string, poolAddress: string, bptDecimals = 18) {
    this.poolId = poolId;
    this.poolAddress = poolAddress;
    this.balancer = balancer;
    this.hasFetchedPools = false;
    this.swapRouteLoading = false;
    this.bptDecimals = bptDecimals;
    this.fetchPools();
  }

  private getProvider = useWeb3().getProvider;
  private toFiat = useNumbers().toFiat;

  private async getGasPrice(): Promise<BigNumber> {
    const gasPriceParams = await gasPriceService.getGasPrice();
    if (gasPriceParams) return BigNumber.from(gasPriceParams.price);
    return this.getProvider().getGasPrice();
  }

  getFiatValueIn(amountsIn: string[], tokensIn: string[]): string {
    return this.toFiat(amountsIn[0], tokensIn[0]);
  }

  getFiatValueOut(bptOut: string, pool: Pool) {
    // toFiat(bpt, poolAddress)
    const { totalLiquidity = '', totalShares = '' } = pool || {};
    return bnum(totalLiquidity)
      .div(bnum(totalShares))
      .times(bnum(bptOut))
      .toString();
  }

  getBptOut(swapRoute: SwapInfo, bptDecimals: number) {
    return formatFixed(swapRoute.returnAmountFromSwaps, bptDecimals || 18);
  }

  async findRouteGivenIn(
    tokenIn: string,
    amount: string,
    decimals: number,
    pool: Pool
  ): Promise<JoinPoolReturnValue> {
    this.swapRouteLoading = true;
    if (!this.hasFetchedPools) {
      await this.fetchPools();
    }

    // const amount = amounts.value[0];
    // const decimals = poolTokens.value[0].decimals;
    const safeAmount = overflowProtected(amount, decimals);
    const bnumAmount = parseFixed(safeAmount, decimals);

    const gasPrice = await this.getGasPrice();
    const findRouteParams = {
      tokenIn,
      tokenOut: this.poolAddress,
      amount: bnumAmount,
      gasPrice,
      maxPools: 4,
    };

    const route = await balancer.swaps.findRouteGivenIn(findRouteParams);

    const bptOut = this.getBptOut(route, this.bptDecimals);
    const fiatValueOut = this.getFiatValueOut(bptOut, pool);
    const fiatValueIn = this.getFiatValueIn([amount], [tokenIn]);
    const priceImpact = this.getPriceImpact(fiatValueIn, fiatValueOut);
    const priceImpactFiat = this.getPriceImpactFiat(fiatValueIn, fiatValueOut);
    this.swapRouteLoading = false;
    console.log({
      route,
      fiatValueOut,
      bptOut,
      priceImpact,
      priceImpactFiat,
    });
    return { route, fiatValueOut, bptOut, priceImpact, priceImpactFiat };
  }

  async fetchPools() {
    this.hasFetchedPools = await balancer.swaps.fetchPools();
  }

  // Calculate price impact.
  // Difference between fiat value in & fiat value out
  private getPriceImpact(fiatValueIn: string, fiatValueOut: string): number {
    console.log({ fiatValueIn, fiatValueOut });
    const bnumFiatValueIn = bnum(fiatValueIn);
    const bnumFiatValueOut = bnum(fiatValueOut);

    // Don't return negative price impact
    return Math.max(
      0,
      bnumFiatValueIn
        .minus(bnumFiatValueOut)
        .div(bnumFiatValueIn.plus(bnumFiatValueOut).div(bnum(2)))
        .toNumber() || 0
    );
  }

  private getPriceImpactFiat(
    fiatValueIn: string,
    fiatValueOut: string
  ): string {
    return Math.min(
      0,
      bnum(fiatValueOut).minus(bnum(fiatValueIn)).toNumber()
    ).toString();
  }

  private getSwapAttributes(
    swapInfo: SwapInfo,
    slippageBsp: number,
    userAddress: string
  ) {
    const deadline = BigNumber.from(`${Math.ceil(Date.now() / 1000) + 60}`); // 60 seconds from now
    return balancer.swaps.buildSwap({
      userAddress,
      swapInfo,
      kind: 0,
      deadline,
      maxSlippage: slippageBsp,
    });
  }

  async join(
    route: SwapInfo,
    slippageBsp: number,
    userAddress: string
  ): Promise<TransactionResponse> {
    const buildSwapResult = this.getSwapAttributes(
      route,
      slippageBsp,
      userAddress
    );

    const attributes: BatchSwap = buildSwapResult.attributes as BatchSwap;
    const tx = await vaultService.batchSwap(
      attributes.kind,
      attributes.swaps,
      attributes.assets,
      attributes.funds,
      attributes.limits as string[]
    );
    return tx;
  }
}
