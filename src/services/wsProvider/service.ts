import { WebSocketProvider } from '@ethersproject/providers';
import configs from '@/lib/config';

const NETWORK = process.env.VUE_APP_NETWORK || '1';

type NewBlockHandler = (blockNumber: number) => void;

export default class Service {
  network: string;
  wsProvider: WebSocketProvider;

  constructor() {
    this.network = configs[NETWORK].shortName;
    this.wsProvider = new WebSocketProvider(configs[NETWORK].ws);
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
