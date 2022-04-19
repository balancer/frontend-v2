import { Network } from '@balancer-labs/sdk';
import {
  JsonRpcBatchProvider,
  JsonRpcProvider,
  WebSocketProvider
} from '@ethersproject/providers';

import { networkId } from '@/composables/useNetwork';
import { twentyFourHoursInSecs } from '@/composables/useTime';
import template from '@/lib/utils/template';
import ConfigService, { configService } from '@/services/config/config.service';

import { TimeTravelPeriod } from '../balancer/subgraph/types';

type NewBlockHandler = (blockNumber: number) => any;

export default class RpcProviderService {
  readonly network: string;
  jsonProvider: JsonRpcProvider;
  wsProvider: WebSocketProvider;
  loggingProvider: JsonRpcProvider;

  constructor(private readonly config: ConfigService = configService) {
    this.network = this.config.network.shortName;
    this.jsonProvider = new JsonRpcBatchProvider(this.config.rpc);
    this.wsProvider = new WebSocketProvider(this.config.ws);
    this.loggingProvider = new JsonRpcBatchProvider(this.config.loggingRpc);
  }

  public initBlockListener(newBlockHandler: NewBlockHandler): void {
    this.wsProvider.on('block', newBlockNumber =>
      newBlockHandler(newBlockNumber)
    );
  }

  public async getBlockNumber(): Promise<number> {
    return await this.jsonProvider.getBlockNumber();
  }

  public getJsonProvider(networkKey: Network): JsonRpcProvider {
    const rpcUrl = template(this.config.getNetworkConfig(networkKey).rpc, {
      INFURA_KEY: this.config.env.INFURA_PROJECT_ID,
      ALCHEMY_KEY: this.config.env.ALCHEMY_KEY
    });
    return new JsonRpcBatchProvider(rpcUrl);
  }

  public async getTimeTravelBlock(period: TimeTravelPeriod): Promise<number> {
    const currentBlock = await rpcProviderService.getBlockNumber();
    const blocksInDay = Math.round(twentyFourHoursInSecs / this.blockTime);

    switch (period) {
      case '24h':
        return currentBlock - blocksInDay;
      default:
        return currentBlock - blocksInDay;
    }
  }

  public get blockTime(): number {
    switch (networkId.value) {
      case Network.MAINNET:
        return 13;
      case Network.POLYGON:
        return 2;
      case Network.ARBITRUM:
        return 3;
      case Network.KOVAN:
        // Should be ~4s but this causes subgraph to return with unindexed block error.
        return 1;
      default:
        return 13;
    }
  }
}

export const rpcProviderService = new RpcProviderService();
