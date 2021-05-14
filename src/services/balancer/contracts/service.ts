import Vault from './contracts/vault';
import configs, { Config } from '@/lib/config';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { JsonRpcProvider } from '@ethersproject/providers';
import getProvider from '@/lib/utils/provider';
import { default as vaultAbi } from '@/lib/abi/Vault.json';
import { default as weightedPoolAbi } from '@/lib/abi/WeightedPool.json';
import { default as stablePoolAbi } from '@/lib/abi/StablePool.json';
import { default as TokenAbi } from '@/lib/abi/ERC20.json';

const NETWORK = process.env.VUE_APP_NETWORK || '1';

export default class Service {
  vault: Vault;
  config: Config;
  provider: JsonRpcProvider;
  multiCaller: Multicaller;

  constructor() {
    this.provider = getProvider(NETWORK);
    this.config = configs[NETWORK];
    this.multiCaller = new Multicaller(NETWORK, this.provider, this.allABIs);

    // Init contracts
    this.vault = new Vault(this);
  }

  // Combine all the ABIs and remove duplicates
  public get allABIs() {
    return Object.values(
      Object.fromEntries(
        [
          ...vaultAbi,
          ...weightedPoolAbi,
          ...stablePoolAbi,
          ...TokenAbi
        ].map(row => [row.name, row])
      )
    );
  }
}
