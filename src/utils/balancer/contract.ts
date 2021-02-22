import set from 'lodash.set';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { Interface } from '@ethersproject/abi';
import dockerParity from '@/utils/balancer/configs/docker-parity.json';
import { abi as multicallAbi } from './abi/Multicall.json';

export const MULTICALL = {
  '1': '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
  '4': '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
  '17': dockerParity.multicall,
  '42': '0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a',
  '1337': '0x566131e85d46cc7BBd0ce5C6587E9912Dc27cDAc'
};

export async function call(provider, abi: any[], call: any[], options?) {
  const contract = new Contract(call[0], abi, provider);
  try {
    const params = call[2] || [];
    return await contract[call[1]](...params, options || {});
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function multicall(
  network: string,
  provider,
  abi: any[],
  calls: any[],
  options?
) {
  const multi = new Contract(MULTICALL[network], multicallAbi, provider);
  const itf = new Interface(abi);
  try {
    const [, res] = await multi.aggregate(
      calls.map(call => [
        call[0].toLowerCase(),
        itf.encodeFunctionData(call[1], call[2])
      ]),
      options || {}
    );
    return res.map((call, i) => itf.decodeFunctionResult(calls[i][1], call));
  } catch (e) {
    return Promise.reject(e);
  }
}

export class Multicaller {
  public network: string;
  public provider: JsonRpcProvider;
  public abi: any[];
  public options: any = {};
  public calls: any[] = [];
  public paths: any[] = [];

  constructor(
    network: string,
    provider: JsonRpcProvider,
    abi: any[],
    options?
  ) {
    this.network = network;
    this.provider = provider;
    this.abi = abi;
    this.options = options || {};
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
      this.calls,
      this.options
    );
    this.paths.forEach((path, i) => set(obj, path, result[i][0]));
    this.calls = [];
    this.paths = [];
    return obj;
  }
}
