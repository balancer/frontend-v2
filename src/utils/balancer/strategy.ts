import { JsonRpcProvider } from '@ethersproject/providers';

export default class Strategy {
  public network: string;
  public provider: JsonRpcProvider;
  public type: number;
  public address: string;

  constructor(
    network: string,
    provider: JsonRpcProvider,
    type: number,
    address: string
  ) {
    this.network = network;
    this.provider = provider;
    this.type = type;
    this.address = address;
  }

  async load() {
    return;
  }
}
