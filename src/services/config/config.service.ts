import { Config } from '@/lib/config';
import configs from '@/lib/config';

interface Env {
  APP_ENV: string;
  NETWORK: string;
  APP_DOMAIN: string;
  IPFS_NODE: string;
  BLOCKNATIVE_DAPP_ID: string;
  ALCHEMY_KEY: string;
  PORTIS_DAPP_ID: string;
  ENABLE_STABLE_POOLS: boolean;
}

export default class ConfigService {
  public get env(): Env {
    return {
      APP_ENV: process.env.VUE_APP_ENV || 'development',
      NETWORK: process.env.VUE_APP_NETWORK || '1',
      APP_DOMAIN: process.env.VUE_APP_DOMAIN || 'app.balancer.fi',
      IPFS_NODE: process.env.VUE_APP_IPFS_NODE || 'ipfs.io',
      BLOCKNATIVE_DAPP_ID: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || 'xxx',
      ALCHEMY_KEY:
        process.env.VUE_APP_ALCHEMY_KEY || 'cQGZUiTLRCFsQS7kbRxPJK4eH4fTTu88',
      ENABLE_STABLE_POOLS: process.env.VUE_APP_ENABLE_STABLE_POOLS === 'true',
      PORTIS_DAPP_ID:
        process.env.PORTIS_DAPP_ID || '3f1c3cfc-7dd5-4e8a-aa03-71ff7396d9fe'
    };
  }

  public get network(): Config {
    return configs[this.env.NETWORK];
  }

  public getNetworkConfig(key: string): Config {
    return configs[key];
  }
}

export const configService = new ConfigService();
