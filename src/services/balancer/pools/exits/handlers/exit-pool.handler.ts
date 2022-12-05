import { Address, BalancerSDK } from '@balancer-labs/sdk';
import { AmountOut } from '@/providers/local/exit-pool.provider';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { JsonRpcSigner } from '@ethersproject/providers';

export type AmountsOut = Record<Address, string>;

export enum ExitType {
  GivenIn, // When BPT in is specified.
  GivenOut, // When an amount out is specified.
}

export type ExitParams = {
  exitType: ExitType;
  bptIn: string;
  amountsOut: AmountOut[];
  tokenInfo: TokenInfoMap;
  prices: TokenPrices;
  signer: JsonRpcSigner;
  slippageBsp: number;
  relayerSignature?: string;
};

export type QueryOutput = {
  priceImpact: number;
  amountsOut: AmountsOut;
};

export abstract class ExitPoolHandler {
  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  abstract exit(params: ExitParams): Promise<TransactionResponse>;

  abstract queryExit(params: ExitParams): Promise<QueryOutput>;
}
