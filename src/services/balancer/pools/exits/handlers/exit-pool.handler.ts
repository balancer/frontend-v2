import { Address, BalancerSDK } from '@balancer-labs/sdk';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import { SwapExitParams } from './swap-exit.handler';
import { LegacySwapExitParams } from './legacy-swap-exit.handler';
import { GeneralisedExitParams } from './generalised-exit.handler';

export type AmountsOut = Record<Address, string>;

export enum ExitType {
  SwapGivenIn, // When BPT in is specified.
  SwapGivenOut, // When an amount out is specified.
  LegacySwapGivenIn, // When BPT in is specified.
  LegacySwapGivenOut, // When an amount out is specified.
  DeepGivenIn, // When BPT in is specified.
}

export type ExitParams =
  | LegacySwapExitParams
  | SwapExitParams
  | GeneralisedExitParams;

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
