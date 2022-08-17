import { Network } from '@balancer-labs/sdk';
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers';

import template from '@/lib/utils/template';
import { configService } from '@/services/config/config.service';

import { StaticJsonRpcBatchProvider } from './static-json-rpc-batch-provider';

type NewBlockHandler = (blockNumber: number) => any;

export default class RpcProviderService {
  constructor(
    private readonly config = configService,
    public readonly network = config.network.shortName,
    public readonly jsonProvider = new StaticJsonRpcBatchProvider(config.rpc),
    public readonly loggingProvider = new StaticJsonRpcBatchProvider(
      config.loggingRpc
    )
  ) {}

  public initBlockListener(newBlockHandler: NewBlockHandler): void {
    const wsProvider = new WebSocketProvider(this.config.ws);
    wsProvider.once('block', newBlockNumber => {
      let currentBlockNumber = newBlockNumber;
      newBlockHandler(currentBlockNumber);
      setInterval(() => {
        currentBlockNumber++;
        newBlockHandler(currentBlockNumber);
      }, configService.network.blockTime * 1000);
    });
  }

  public async getBlockNumber(): Promise<number> {
    return await this.jsonProvider.getBlockNumber();
  }

  public getJsonProvider(networkKey: Network): JsonRpcProvider {
    const rpcUrl = template(this.config.getNetworkConfig(networkKey).rpc, {
      INFURA_KEY: this.config.env.INFURA_PROJECT_ID,
      ALCHEMY_KEY: this.config.env.ALCHEMY_KEY,
    });
    return new StaticJsonRpcBatchProvider(rpcUrl);
  }
}

export const rpcProviderService = new RpcProviderService();
