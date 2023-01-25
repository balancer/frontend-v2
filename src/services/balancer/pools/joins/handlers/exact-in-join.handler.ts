import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, PoolWithMethods } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { JoinParams, JoinPoolHandler, QueryOutput } from './join-pool.handler';
import { balancer } from '@/lib/balancer.sdk';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { bnum, findByAddress, selectByAddress } from '@/lib/utils';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

/**
 * Handles generalized joins for deep pools using SDK functions.
 */
export class ExactInJoinHandler implements JoinPoolHandler {
  private lastJoinRes?: ReturnType<PoolWithMethods['buildJoin']>;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async join(params: JoinParams): Promise<TransactionResponse> {
    await this.queryJoin(params);

    if (!this.lastJoinRes) {
      throw new Error('Could not query generalised join');
    }

    const txBuilder = new TransactionBuilder(params.signer);
    const { to, data } = this.lastJoinRes;

    return txBuilder.raw.sendTransaction({ to, data });
  }

  async queryJoin({
    amountsIn,
    tokensIn,
    signer,
    slippageBsp,
  }: JoinParams): Promise<QueryOutput> {
    const tokenAddresses: string[] = this.pool.value.tokensList;
    console.log('EXACT IN JOIN', { amountsIn, tokensIn }, this.pool.value);
    const evmAmountsIn: string[] = tokenAddresses.map(address => {
      const token = selectByAddress(tokensIn, address);

      if (!token) return '0';

      const value = findByAddress(amountsIn, address)?.value;
      return parseFixed(value || '0', token.decimals).toString();
    });

    const signerAddress = await signer.getAddress();
    const slippage = slippageBsp.toString();
    const sdkPool = await balancer.pools.find(this.pool.value.id);

    if (!sdkPool) throw new Error('Failed to find pool: ' + this.pool.value.id);

    console.log({
      tokenAddresses,
      evmAmountsIn,
      signerAddress,

      slippage,
    });

    this.lastJoinRes = await sdkPool.buildJoin(
      signerAddress,
      tokenAddresses,
      evmAmountsIn,
      slippage
    );

    if (!this.lastJoinRes) {
      throw new Error('Failed to fetch expected output.');
    }

    const bptOut = formatFixed(
      this.lastJoinRes.minBPTOut,
      this.pool.value.onchain?.decimals || 18
    );

    const evmPriceImpact = await sdkPool.calcPriceImpact(
      evmAmountsIn,
      this.lastJoinRes.minBPTOut,
      true
    );

    const priceImpact = Number(formatFixed(evmPriceImpact, 18));

    if (bnum(bptOut).eq(0)) throw new Error('Not enough liquidity.');
    return {
      bptOut,
      priceImpact,
    };
  }
}
