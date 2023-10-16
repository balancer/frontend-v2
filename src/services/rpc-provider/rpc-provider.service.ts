import { Network } from '@/lib/config/types';
import { JsonRpcProvider } from '@ethersproject/providers';

import { configService } from '@/services/config/config.service';

import { StaticJsonRpcBatchProvider } from './static-json-rpc-batch-provider';

type NewBlockHandler = (blockNumber: number) => any;

export default class RpcProviderService {
  constructor(
    private readonly config = configService,
    public readonly network = config.network.shortName,
    public readonly jsonProvider = new StaticJsonRpcBatchProvider(config.rpc)
  ) {}

  public initBlockListener(newBlockHandler: NewBlockHandler): void {
    this.jsonProvider.once('block', newBlockNumber => {
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
    return new StaticJsonRpcBatchProvider(
      this.config.getNetworkRpc(networkKey)
    );
  }
}

export const rpcProviderService = new RpcProviderService();
