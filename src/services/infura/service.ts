import { WebSocketProvider } from '@ethersproject/providers';

const INFURA_PROJECT_ID = process.env.VUE_APP_INFURA_PROJECT_ID;
const NETWORK = process.env.VUE_APP_NETWORK || '1';

const networkMap: Record<string, string> = {
  '1': 'mainnet',
  '42': 'kovan'
};

type NewBlockHandler = (blockNumber: number) => void;

export default class Service {
  network: string;
  wsProvider: WebSocketProvider;

  constructor() {
    if (!INFURA_PROJECT_ID) throw new Error('Infura project ID missing!');

    this.network = networkMap[NETWORK];
    this.wsProvider = new WebSocketProvider(
      `wss://${this.network}.infura.io/ws/v3/${INFURA_PROJECT_ID}`
    );
  }

  public initBlockListener(newBlockHandler: NewBlockHandler): void {
    this.wsProvider.on('block', newBlockNumber =>
      newBlockHandler(newBlockNumber)
    );
  }
}
