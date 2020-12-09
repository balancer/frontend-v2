import { JsonRpcProvider } from '@ethersproject/providers';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import set from 'lodash/set';

export default class Multicaller {
  public network: string;
  public provider: JsonRpcProvider;
  public abi: any[];
  public calls: any[] = [];
  public paths: any[] = [];

  constructor(network: string, provider: JsonRpcProvider, abi: any[]) {
    this.network = network;
    this.provider = provider;
    this.abi = abi;
  }

  call(path, address, fn, params?): Multicaller {
    this.calls.push([address, fn, params]);
    this.paths.push(path);
    return this;
  }

  async execute(from?: any): Promise<any> {
    const obj = from || {};
    const result = await multicall(
      this.network,
      this.provider,
      this.abi,
      this.calls
    );
    this.paths.forEach((path, i) => set(obj, path, result[i][0]));
    this.calls = [];
    this.paths = [];
    return obj;
  }
}
