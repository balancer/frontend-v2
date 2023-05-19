import { Pool } from '@/services/pool/types';
import { BalancerSDK, SimulationType } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import {
  ExitParams,
  ExitPoolHandler,
  QueryOutput,
  AmountsOut,
} from './exit-pool.handler';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { bnum, isSameAddress } from '@/lib/utils';
import { flatTokenTree } from '@/composables/usePoolHelpers';
import { getAddress } from '@ethersproject/address';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

type BalancerSdkType = ReturnType<typeof getBalancerSDK>;
type ExitResponse = Awaited<
  ReturnType<BalancerSdkType['pools']['generalisedExit']>
>;

/**
 * Handles exits using SDK's generalisedExit function.
 */
export class GeneralisedExitHandler implements ExitPoolHandler {
  private lastExitRes?: ExitResponse;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {
    await this.queryExit(params);

    if (!this.lastExitRes) {
      throw new Error('Could not query generalised exit');
    }

    const txBuilder = new TransactionBuilder(params.signer);
    const { to, encodedCall } = this.lastExitRes;

    return txBuilder.raw.sendTransaction({ to, data: encodedCall });
  }

  async queryExit({
    bptIn,
    signer,
    slippageBsp,
    relayerSignature,
    approvalActions,
    bptInValid,
  }: ExitParams): Promise<QueryOutput> {
    const evmAmountIn = parseFixed(
      bptIn || '0',
      this.pool.value.onchain?.decimals ?? 18
    );

    if (evmAmountIn.lte(0)) throw new Error('BPT in amount is 0.');

    const signerAddress = await signer.getAddress();
    const slippage = slippageBsp.toString();

    // Static call simulation is more accurate than VaultModel, but requires relayer approval and
    // account to have enough BPT balance
    const simulationType: SimulationType =
      bptInValid && !approvalActions.length
        ? SimulationType.Static
        : SimulationType.VaultModel;

    console.log({ simulationType });

    const balancer = getBalancerSDK();
    this.lastExitRes = await balancer.pools
      .generalisedExit(
        this.pool.value.id,
        evmAmountIn.toString(),
        signerAddress,
        slippage,
        signer,
        simulationType,
        relayerSignature
      )
      .catch(err => {
        console.error(err);
        throw new Error('Failed to query exit.');
      });

    if (!this.lastExitRes) throw new Error('Failed to query exit.');

    const priceImpact: number = bnum(
      formatFixed(this.lastExitRes.priceImpact, 18)
    ).toNumber();

    return {
      priceImpact,
      amountsOut: this.formatAmountsOut(this.lastExitRes),
    };
  }

  /**
   * PRIVATE METHODS
   */
  private formatAmountsOut(exitRes: ExitResponse): AmountsOut {
    const amountsOut: AmountsOut = {};
    const allPoolTokens = flatTokenTree(this.pool.value);

    exitRes.expectedAmountsOut.forEach((amount, i) => {
      const token = allPoolTokens.find(poolToken =>
        isSameAddress(poolToken.address, exitRes.tokensOut[i])
      );

      if (token) {
        const realAddress = getAddress(token.address);
        const scaledAmount = formatFixed(
          amount,
          token.decimals ?? 18
        ).toString();
        amountsOut[realAddress] = scaledAmount;
      }
    });

    return amountsOut;
  }
}
