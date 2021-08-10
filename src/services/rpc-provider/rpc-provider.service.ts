import { WebSocketProvider, JsonRpcProvider } from '@ethersproject/providers';
import ConfigService, { configService } from '@/services/config/config.service';

type NewBlockHandler = (blockNumber: number) => any;

export default class RpcProviderService {
  readonly network: string;
  jsonProvider: JsonRpcProvider;
  wsProvider: WebSocketProvider;
  loggingProvider: JsonRpcProvider;

  constructor(private readonly config: ConfigService = configService) {
    this.network = this.config.network.shortName;
    this.jsonProvider = new JsonRpcProvider(this.config.network.rpc);
    this.wsProvider = new WebSocketProvider(this.config.network.ws);
    this.loggingProvider = new JsonRpcProvider(this.config.network.loggingRpc);
  }

  public initBlockListener(newBlockHandler: NewBlockHandler): void {
    this.wsProvider.on('block', newBlockNumber =>
      newBlockHandler(newBlockNumber)
    );
  }

  public async getBlockNumber(): Promise<number> {
    return await this.jsonProvider.getBlockNumber();
  }

  public getJsonProvider(networkKey: string): JsonRpcProvider {
    const rpcUrl = this.config.getNetworkConfig(networkKey).rpc;
    return new JsonRpcProvider(rpcUrl);
  }
}

export const rpcProviderService = new RpcProviderService();
