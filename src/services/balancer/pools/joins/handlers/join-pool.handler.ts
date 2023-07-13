import { AmountIn } from '@/providers/local/join-pool.provider';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { TransactionActionInfo } from '@/types/transactions';
import { BalancerSDK } from '@sobal/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { JsonRpcSigner } from '@ethersproject/providers';

export type JoinParams = {
  amountsIn: AmountIn[];
  tokensIn: TokenInfoMap;
  signer: JsonRpcSigner;
  slippageBsp: number;
  relayerSignature?: string;
  approvalActions: TransactionActionInfo[];
  transactionDeadline: number;
};

export type QueryOutput = {
  bptOut: string;
  priceImpact: number;
};

export abstract class JoinPoolHandler {
  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK
  ) {}

  abstract join(params: JoinParams): Promise<TransactionResponse>;

  abstract queryJoin(params: JoinParams): Promise<QueryOutput>;
}
