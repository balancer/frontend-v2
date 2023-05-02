import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import {
  BalancerSDK,
  BatchRelayerLibrary__factory,
  PoolWithMethods,
} from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import {
  AmountsOut,
  ExitParams,
  ExitPoolHandler,
  QueryOutput,
} from './exit-pool.handler';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { isSameAddress, removeAddress } from '@/lib/utils';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { flatTokenTree } from '@/composables/usePoolHelpers';
import { getAddress } from '@ethersproject/address';
import { PoolKind } from '@balancer-labs/sdk';
import { parseUnits } from '@ethersproject/units';
import { configService } from '@/services/config/config.service';
import { getEthersContract } from '@/dependencies/EthersContract';
import BatchRelayer from '@/lib/abi/BatchRelayer.json';

export type RecoveryExitResponse = ReturnType<
  PoolWithMethods['buildRecoveryExit']
>;

const relayerLibrary = BatchRelayerLibrary__factory.createInterface();
const EthersContract = getEthersContract();

/**
 * Handles specific case where we want to exit a linear pool to internal
 * balances and then withdraw the main token from the internal balance via a
 * batch relayer call.
 *
 * Originally built to handle the withdrawals from the Euler linear pools.
 */
export class LinearViaInternalBalance implements ExitPoolHandler {
  private lastExitRes?: RecoveryExitResponse;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {
    await this.queryExit(params);

    if (!this.lastExitRes) throw new Error('Failed to construct exit.');

    const relayerSteps = this.buildRelayerSteps(this.lastExitRes);
    const to = configService.network.addresses.batchRelayer;
    const batchRelayer = new EthersContract(to, BatchRelayer);
    const data = batchRelayer.interface.encodeFunctionData('multicall', [
      relayerSteps,
    ]);

    const txBuilder = new TransactionBuilder(params.signer);

    return txBuilder.raw.sendTransaction({ to, data });
  }

  async queryExit(params: ExitParams): Promise<QueryOutput> {
    const { signer, bptIn, slippageBsp } = params;
    const exiter = await signer.getAddress();
    const slippage = slippageBsp.toString();
    const sdkPool = await getBalancerSDK().pools.find(this.pool.value.id);

    if (!sdkPool) throw new Error('Failed to find pool: ' + this.pool.value.id);

    const evmBptIn = parseFixed(bptIn, 18).toString();

    // We want to exit to the internal balance as the first step in the relayer actions.
    const toInternalBalance = true;

    this.lastExitRes = await sdkPool.buildRecoveryExit(
      exiter,
      evmBptIn,
      slippage,
      toInternalBalance
    );

    if (!this.lastExitRes) throw new Error('Failed to construct exit.');

    const tokensOut = removeAddress(
      this.pool.value.address,
      this.lastExitRes.attributes.exitPoolRequest.assets
    );

    const expectedAmountsOut = this.lastExitRes.expectedAmountsOut;
    // Because this is an exit we need to pass amountsOut as the amountsIn and
    // bptIn as the minBptOut to this calcPriceImpact function.
    const evmPriceImpact = await sdkPool.calcPriceImpact(
      expectedAmountsOut,
      evmBptIn,
      false
    );

    const priceImpact = Number(formatFixed(evmPriceImpact, 18));

    const amountsOut = this.getAmountsOut(expectedAmountsOut, tokensOut);

    return {
      amountsOut,
      priceImpact,
    };
  }

  private getAmountsOut(
    expectedAmountsOut: string[],
    tokensOut: string[]
  ): AmountsOut {
    const amountsOut: AmountsOut = {};
    const allPoolTokens = flatTokenTree(this.pool.value);

    expectedAmountsOut.forEach((amount, i) => {
      const token = allPoolTokens.find(poolToken =>
        isSameAddress(poolToken.address, tokensOut[i])
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

  private buildRelayerSteps(queryOutput: RecoveryExitResponse): string[] {
    return [
      this.buildExitAction(queryOutput),
      this.buildWithdrawalFromInternalBalanceAction(queryOutput),
    ];
  }

  private buildExitAction(queryOutput: RecoveryExitResponse): string {
    const { exitPoolRequest, sender, recipient, poolId } =
      queryOutput.attributes;

    return relayerLibrary.encodeFunctionData('exitPool', [
      poolId,
      PoolKind.LEGACY_STABLE,
      sender,
      recipient,
      exitPoolRequest,
      [],
    ]);
  }

  private buildWithdrawalFromInternalBalanceAction(
    queryOutput: RecoveryExitResponse
  ): string {
    const { sender, recipient } = queryOutput.attributes;
    const kind = 3; // OP_KIND.TRANSFER_EXTERNAL
    const mainTokenIndex = this.pool.value?.mainIndex || 0;
    const asset = this.pool.value.tokensList[mainTokenIndex];
    const tokensOut = removeAddress(
      this.pool.value.address,
      queryOutput.attributes.exitPoolRequest.assets
    );
    const assetIndex = tokensOut.findIndex(t => isSameAddress(t, asset));
    const amount = queryOutput.expectedAmountsOut[assetIndex];
    const value = parseUnits('0');

    console.log('internalBalanceWithdrawalAction', { asset, amount });
    return relayerLibrary.encodeFunctionData('manageUserBalance', [
      [{ kind, asset, amount, sender, recipient }],
      value,
    ]);
  }
}
