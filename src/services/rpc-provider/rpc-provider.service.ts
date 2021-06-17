import { WebSocketProvider } from '@ethersproject/providers';
import ConfigService from '@/services/config/config.service';

type NewBlockHandler = (blockNumber: number) => any;

export default class RpcProviderService {
  network: string;
  wsProvider: WebSocketProvider;

  constructor(private readonly configService = new ConfigService()) {
    this.network = configService.network.shortName;
    this.wsProvider = new WebSocketProvider(configService.network.ws);
  }

  public initBlockListener(newBlockHandler: NewBlockHandler): void {
    this.wsProvider.on('block', newBlockNumber =>
      newBlockHandler(newBlockNumber)
    );
  }

  public async getBlockNumber(): Promise<number> {
    return await this.wsProvider.getBlockNumber();
  }
}
