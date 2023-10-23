import { Pool } from '@/services/pool/types';
import { BalancerSDK, AssetHelpers } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { JoinParams, JoinPoolHandler, QueryOutput } from './join-pool.handler';
import { includesAddress, isSameAddress } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { defaultAbiCoder } from '@ethersproject/abi';

type TxJoinParams = [
  poolId: string,
  sender: string,
  recipient: string,
  request: {
    assets: string[];
    maxAmountsIn: string[];
    userData: string;
    fromInternalBalance: boolean;
  }
];

const buildParams = (
  poolId: string,
  sender: string,
  assets: string[],
  limits: string[] = [],
  bptOut: string
) =>
  [
    poolId,
    sender,
    sender,
    {
      assets,
      maxAmountsIn: limits,
      userData: defaultAbiCoder.encode(['uint256', 'uint256'], [3, bptOut]),
      fromInternalBalance: false,
    },
  ] as TxJoinParams;

/**
 * Handles joins with pool tokens using SDK functions.
 */
export class ExactInJoinHandler implements JoinPoolHandler {
  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK
  ) {}

  async join(params: JoinParams): Promise<TransactionResponse> {
    const signerAddress = await params.signer.getAddress();
    const [sortedTokens] = new AssetHelpers(
      configService.network.tokens.Addresses.nativeAsset
    ).sortTokens(Object.keys(params.tokensIn));

    const queryResult = await this.queryJoin(params);

    const txParams = buildParams(
      this.pool.value.id,
      signerAddress,
      sortedTokens,
      [],
      params.bptOut || '0'
    );

    if (!queryResult || !queryResult.maxAmountsIn) {
      throw new Error('Could not query exact out join');
    }

    // Setup limits
    txParams[3].maxAmountsIn = queryResult.maxAmountsIn.map(String);

    let value = '0';

    // value property must be passed if joining with native asset
    if (
      includesAddress(
        txParams[3].assets,
        configService.network.tokens.Addresses.nativeAsset
      )
    ) {
      // find native asset index
      const nativeAssetIndex = txParams[3].assets.findIndex(address =>
        isSameAddress(
          address,
          configService.network.tokens.Addresses.nativeAsset
        )
      );
      value = txParams[3].maxAmountsIn[nativeAssetIndex];
    }

    const tx = await this.sdk.contracts.vault
      .connect(params.signer)
      .joinPool(...txParams, { value });

    return tx;
  }

  async queryJoin({
    tokensIn,
    signer,
    bptOut,
  }: JoinParams): Promise<QueryOutput> {
    // Sort the amountsIn by token address
    const [sortedTokens] = new AssetHelpers(
      configService.network.tokens.Addresses.nativeAsset
    ).sortTokens(Object.keys(tokensIn));

    const signerAddress = await signer.getAddress();

    const txParams = buildParams(
      this.pool.value.id,
      signerAddress,
      sortedTokens,
      [],
      bptOut || '0'
    );

    const queryResult =
      await this.sdk.contracts.balancerHelpers.callStatic.queryJoin(
        ...txParams
      );

    if (queryResult.amountsIn.length !== sortedTokens.length) {
      throw new Error('Failed to fetch expected output.');
    }

    return {
      bptOut: String(queryResult.bptOut),
      maxAmountsIn: queryResult.amountsIn,
      priceImpact: 0,
    };
  }
}
