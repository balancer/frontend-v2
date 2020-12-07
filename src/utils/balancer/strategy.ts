import { JsonRpcProvider } from '@ethersproject/providers';
import strategies from './strategies';

export default class Strategy {
  public network: string;
  public provider: JsonRpcProvider;
  public type: number;
  public address: string;
  public name: string;

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
    this.name = strategies[type].name;
  }

  async load() {
    return;
  }
}
