import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { JoinParams, JoinPoolHandler, QueryOutput } from './join-pool.handler';
import { getBalancer } from '@/dependencies/balancer-sdk';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { bnum, selectByAddress } from '@/lib/utils';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

const balancer = getBalancer();
type JoinResponse = Awaited<ReturnType<typeof balancer.pools.generalisedJoin>>;

/**
 * Handles generalized joins for deep pools using SDK functions.
 */
export class GeneralisedJoinHandler implements JoinPoolHandler {
  private lastJoinRes?: JoinResponse;

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
    const { to, callData } = this.lastJoinRes;

    return txBuilder.raw.sendTransaction({ to, data: callData });
  }

  async queryJoin({
    amountsIn,
    tokensIn,
    signer,
    slippageBsp,
    relayerSignature,
  }: JoinParams): Promise<QueryOutput> {
    const evmAmountsIn: string[] = amountsIn.map(({ address, value }) => {
      const token = selectByAddress(tokensIn, address);

      if (!token || !token.decimals)
        throw new Error(`Token metadata missing for: ${address}`);

      return parseFixed(value || '0', token.decimals).toString();
    });

    const tokenAddresses: string[] = amountsIn.map(({ address }) => address);
    const signerAddress = await signer.getAddress();
    const wrapLeafTokens = false;
    const slippage = slippageBsp.toString();
    const poolId = this.pool.value.id;

    this.lastJoinRes = await balancer.pools.generalisedJoin(
      poolId,
      tokenAddresses,
      evmAmountsIn,
      signerAddress,
      wrapLeafTokens,
      slippage,
      relayerSignature
    );

    if (!this.lastJoinRes) {
      throw new Error('Failed to fetch expected output.');
    }

    const bptOut = formatFixed(
      this.lastJoinRes.expectedOut,
      this.pool.value.onchain?.decimals || 18
    );
    const priceImpact: number = bnum(
      formatFixed(this.lastJoinRes.priceImpact, 18)
    ).toNumber();

    if (bnum(bptOut).eq(0)) throw new Error('Not enough liquidity.');
    return {
      bptOut,
      priceImpact,
    };
  }
}
