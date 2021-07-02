import { WebSocketProvider, JsonRpcProvider } from '@ethersproject/providers';
import ConfigService from '@/services/config/config.service';

type NewBlockHandler = (blockNumber: number) => any;

export default class RpcProviderService {
  network: string;
  wsProvider: WebSocketProvider;
  jsonProvider: JsonRpcProvider;

  constructor(private readonly configService = new ConfigService()) {
    this.network = configService.network.shortName;
    this.wsProvider = new WebSocketProvider(configService.network.ws);
    this.jsonProvider = new JsonRpcProvider(configService.network.rpc);
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
    const rpcUrl = this.configService.getNetworkConfig(networkKey).rpc;
    return new JsonRpcProvider(rpcUrl);
  }
}
