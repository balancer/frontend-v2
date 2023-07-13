import { POOLS } from '@/constants/pools';
import { TOKENS } from '@/constants/tokens';
import {
  formatAddressForSor,
  indexOfAddress,
  isSameAddress,
  selectByAddress,
} from '@/lib/utils';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import { Pool } from '@/services/pool/types';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { BalancerSDK, PoolWithMethods } from '@sobal/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { Ref } from 'vue';
import { ExitParams, ExitPoolHandler, QueryOutput } from './exit-pool.handler';

export type ExitExactOutResponse = ReturnType<
  PoolWithMethods['buildExitExactTokensOut']
>;
/**
 * Handles cases where tokens out are specified for the exit using SDK's
 * buildExitExactTokensOut function.
 */
export class ExactOutExitHandler implements ExitPoolHandler {
  private lastExitRes?: ExitExactOutResponse;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {
    await this.queryExit(params);

    if (!this.lastExitRes) throw new Error('Failed to construct exit.');

    const txBuilder = new TransactionBuilder(params.signer);
    const { to, data } = this.lastExitRes;

    return txBuilder.raw.sendTransaction({ to, data });
  }

  async queryExit(params: ExitParams): Promise<QueryOutput> {
    const { signer, tokenInfo, slippageBsp, amountsOut } = params;
    const exiter = await signer.getAddress();
    const slippage = slippageBsp.toString();
    const sdkPool = await getBalancerSDK().pools.find(this.pool.value.id);
    const tokenOut = selectByAddress(tokenInfo, amountsOut[0].address);

    if (!sdkPool) throw new Error('Failed to find pool: ' + this.pool.value.id);
    if (!tokenOut)
      throw new Error('Could not find exit token in pool tokens list.');

    const tokenOutAddress = formatAddressForSor(tokenOut.address);
    const nativeAssetExit = isSameAddress(tokenOutAddress, POOLS.ZeroAddress);

    const poolTokensList = nativeAssetExit
      ? this.replaceWethWithEth(this.pool.value.tokensList)
      : this.pool.value.tokensList;
    const tokenOutIndex = indexOfAddress(poolTokensList, tokenOutAddress);

    const amountOut = amountsOut[0].value;
    const evmAmountOut = parseFixed(amountOut, tokenOut.decimals).toString();

    const fullAmountsOut = this.getFullAmounts(
      poolTokensList,
      tokenOutIndex,
      evmAmountOut
    );

    // Add native asset to the list of tokens to exit
    this.lastExitRes = sdkPool.buildExitExactTokensOut(
      exiter,
      poolTokensList,
      fullAmountsOut,
      slippage
    );
    if (!this.lastExitRes) throw new Error('Failed to construct exit.');

    // Because this is an exit we need to pass amountsOut as the amountsIn and
    // bptIn as the minBptOut to this calcPriceImpact function.
    const evmPriceImpact = await sdkPool.calcPriceImpact(
      fullAmountsOut,
      this.lastExitRes.expectedBPTIn,
      false
    );

    const priceImpact = Number(formatFixed(evmPriceImpact, 18));

    return {
      amountsOut: { [tokenOutAddress]: amountOut },
      priceImpact,
      txReady: true,
    };
  }

  replaceWethWithEth(addresses: string[]): string[] {
    return addresses.map(address => {
      if (isSameAddress(address, TOKENS.Addresses.wNativeAsset)) {
        return POOLS.ZeroAddress;
      }
      return address;
    });
  }

  private getFullAmounts(
    poolTokens: string[],
    tokenOutIndex: number,
    tokenOutAmount: string
  ): string[] {
    // Set token amounts to 0
    const allPoolTokensAmounts = poolTokens.map(() => '0');
    // Set the exit token amount to tokenOutAmount
    allPoolTokensAmounts[tokenOutIndex] = tokenOutAmount || '0';
    return allPoolTokensAmounts;
  }
}
