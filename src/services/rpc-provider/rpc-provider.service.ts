import { WebSocketProvider, JsonRpcProvider } from '@ethersproject/providers';
import ConfigService, { configService } from '@/services/config/config.service';
import { Network } from '@balancer-labs/sdk';
import template from '@/lib/utils/template';

type NewBlockHandler = (blockNumber: number) => any;

export default class RpcProviderService {
  readonly network: string;
  jsonProvider: JsonRpcProvider;
  wsProvider: WebSocketProvider;
  loggingProvider: JsonRpcProvider;

  constructor(private readonly config: ConfigService = configService) {
    this.network = this.config.network.shortName;
    this.jsonProvider = new JsonRpcProvider(this.config.rpc);
    this.wsProvider = new WebSocketProvider(this.config.ws);
    this.loggingProvider = new JsonRpcProvider(this.config.loggingRpc);
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
    return new JsonRpcProvider(rpcUrl);
  }
}

export const rpcProviderService = new RpcProviderService();
