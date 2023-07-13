import { Pool } from '@/services/pool/types';
import { BalancerSDK, PoolWithMethods } from '@sobal/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { JoinParams, JoinPoolHandler, QueryOutput } from './join-pool.handler';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import {
  bnum,
  findByAddress,
  formatAddressForSor,
  includesAddress,
  isSameAddress,
  selectByAddress,
} from '@/lib/utils';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { tokensListExclBpt } from '@/composables/usePoolHelpers';
import { configService } from '@/services/config/config.service';

export type ExactInJoinResponse = ReturnType<PoolWithMethods['buildJoin']>;
/**
 * Handles joins with pool tokens using SDK functions.
 */
export class ExactInJoinHandler implements JoinPoolHandler {
  private joinRes?: ExactInJoinResponse;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK
  ) {}

  async join(params: JoinParams): Promise<TransactionResponse> {
    await this.queryJoin(params);

    if (!this.joinRes) {
      throw new Error('Could not query generalised join');
    }

    const txBuilder = new TransactionBuilder(params.signer);
    const { to, data, value } = this.joinRes;

    // value property must be passed if joining with native asset
    return txBuilder.raw.sendTransaction({ to, data, value });
  }

  async queryJoin({
    amountsIn,
    tokensIn,
    signer,
    slippageBsp,
  }: JoinParams): Promise<QueryOutput> {
    const addressesIn = amountsIn.map(({ address }) => address);
    const tokensList: string[] = this.formatPoolTokensList(addressesIn);
    const _amountsIn: string[] = tokensList.map(address => {
      const token = selectByAddress(tokensIn, address);

      if (!token) return '0';

      const value = findByAddress(amountsIn, address)?.value;
      return parseFixed(value || '0', token.decimals).toString();
    });

    const signerAddress = await signer.getAddress();
    const slippage = slippageBsp.toString();
    const sdkPool = await this.sdk.pools.find(this.pool.value.id);

    if (!sdkPool) throw new Error('Failed to find pool: ' + this.pool.value.id);
    const _tokensIn = tokensList.map(address => formatAddressForSor(address));

    this.joinRes = await sdkPool.buildJoin(
      signerAddress,
      _tokensIn,
      _amountsIn,
      slippage
    );

    if (!this.joinRes) {
      throw new Error('Failed to fetch expected output.');
    }

    const { expectedBPTOut } = this.joinRes;
    if (bnum(expectedBPTOut).eq(0))
      throw new Error('Failed to fetch expected output.');

    const bptOut = formatFixed(
      expectedBPTOut,
      this.pool.value.onchain?.decimals || 18
    );

    const evmPriceImpact = await sdkPool.calcPriceImpact(
      _amountsIn,
      expectedBPTOut,
      true
    );

    const priceImpact = Number(formatFixed(evmPriceImpact, 18));

    return {
      bptOut,
      priceImpact,
    };
  }

  /**
   * If amountsInAddresses contains the native asset, replace the wrapped native
   * asset address in the pool.tokensList with the native asset address.
   *
   * @param {string[]} amountsInAddresses - Addresses of tokens being joined with
   * @returns The pool tokens list or a modified version of it containing the
   * native asset address instead of the wrapped native asset address.
   */
  private formatPoolTokensList(amountsInAddresses: string[]): string[] {
    const { nativeAsset, wNativeAsset } =
      configService.network.tokens.Addresses;
    const includesNativeAsset = includesAddress(
      amountsInAddresses,
      nativeAsset
    );
    const poolTokensList = tokensListExclBpt(this.pool.value);

    if (includesNativeAsset) {
      // Switch the wrapped native asset address for the native asset address
      return poolTokensList.map(address =>
        isSameAddress(address, wNativeAsset) ? nativeAsset : address
      );
    }

    return poolTokensList;
  }
}
