import { WebSocketProvider } from '@ethersproject/providers';

const INFURA_PROJECT_ID = process.env.VUE_APP_INFURA_PROJECT_ID;

type NetworkKey = 1 | 42;
const networkMap = {
  1: 'mainnet',
  42: 'kovan'
};

type NewBlockHandler = (blockNumber: number) => void;

export default class Service {
  network: string;
  wsProvider: WebSocketProvider;

  constructor(networkKey: NetworkKey) {
    if (!INFURA_PROJECT_ID) throw new Error('Infura project ID missing!');
    this.network = networkMap[networkKey];
    this.wsProvider = new WebSocketProvider(
      `wss://${this.network}.infura.io/ws/v3/${INFURA_PROJECT_ID}`
    );
  }

  public switchNetwork(networkKey: NetworkKey): void {
    this.network = networkMap[networkKey];
    if (this.wsProvider) this.wsProvider.removeAllListeners();
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
