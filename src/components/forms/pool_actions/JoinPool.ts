import { balancer } from '@/lib/balancer.sdk';
import { BalancerSDK, SwapInfo } from '@balancer-labs/sdk';
import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import { gasPriceService } from '@/services/gas-price/gas-price.service';
import useWeb3 from '@/services/web3/useWeb3';
import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { bnum } from '@/lib/utils';

export default class JoinPool {
  poolId: string;
  poolAddress: string;
  balancer: BalancerSDK;
  hasFetchedPools: boolean;
  swapRouteLoading: boolean;
  constructor(poolId: string, poolAddress: string) {
    this.poolId = poolId;
    this.poolAddress = poolAddress;
    this.balancer = balancer;
    this.hasFetchedPools = false;
    this.swapRouteLoading = false;
    this.fetchPools();
  }

  getProvider = useWeb3().getProvider;

  async getGasPrice(): Promise<BigNumber> {
    const gasPriceParams = await gasPriceService.getGasPrice();
    if (gasPriceParams) return BigNumber.from(gasPriceParams.price);
    return this.getProvider().getGasPrice();
  }

  async findRouteGivenIn(
    tokenIn: string,
    amount: string,
    decimals: number
  ): Promise<SwapInfo> {
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

    this.swapRouteLoading = false;
    return route;
  }

  async fetchPools() {
    this.hasFetchedPools = await balancer.swaps.fetchPools();
  }

  // Calculate price impact.
  // Difference between fiat value in & fiat value out
  getPriceImpact(fiatValueIn: string, fiatValueOut: string): number {
    const bnumFiatValueIn = bnum(fiatValueIn);
    const bnumFiatValueOut = bnum(fiatValueOut);
    return Math.max(
      0,
      bnumFiatValueIn
        .minus(bnumFiatValueOut)
        .div(bnumFiatValueIn.plus(bnumFiatValueOut).div(bnum(2)))
        .toNumber()
    );
  }

  getSwapAttributes(
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
}
