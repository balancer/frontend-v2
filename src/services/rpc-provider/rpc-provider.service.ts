import { WebSocketProvider, JsonRpcProvider } from '@ethersproject/providers';
import ConfigService, { configService } from '@/services/config/config.service';

type NewBlockHandler = (blockNumber: number) => any;

const _wsProvider = new WebSocketProvider(configService.network.ws);
const _jsonProvider = new JsonRpcProvider(configService.network.rpc);

export default class RpcProviderService {
  network: string;

  constructor(
    private readonly config: ConfigService = configService,
    readonly wsProvider: WebSocketProvider = _wsProvider,
    readonly jsonProvider: JsonRpcProvider = _jsonProvider
  ) {
    this.network = this.config.network.shortName;
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
