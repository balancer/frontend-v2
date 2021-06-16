import { Config } from '@/lib/config';
import configs from '@/lib/config';

interface Env {
  APP_ENV: string;
  NETWORK: string;
  APP_DOMAIN: string;
  IPFS_NODE: string;
  BLOCKNATIVE_DAPP_ID: string;
}

export default class ConfigService {
  public get env(): Env {
    return {
      APP_ENV: process.env.VUE_APP_ENV || 'development',
      NETWORK: process.env.VUE_APP_NETWORK || '1',
      APP_DOMAIN: process.env.VUE_APP_DOMAIN || 'app.balancer.fi',
      IPFS_NODE: process.env.VUE_APP_IPFS_NODE || 'ipfs.io',
      BLOCKNATIVE_DAPP_ID: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || 'xxx'
    };
  }

  public get network(): Config {
    return configs[this.env.NETWORK];
  }
}
