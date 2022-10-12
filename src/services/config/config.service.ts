import { Network } from '@balancer-labs/sdk';

import { networkId } from '@/composables/useNetwork';
import { Config } from '@/lib/config';
import configs from '@/lib/config';
import template from '@/lib/utils/template';

interface Env {
  APP_ENV: string;
  NETWORK: Network;
  APP_DOMAIN: string;
  APP_HOST: string;
  IPFS_NODE: string;
  BLOCKNATIVE_DAPP_ID: string;
  ALCHEMY_KEY: string;
  GRAPH_KEY: string;
  INFURA_PROJECT_ID: string;
  PORTIS_DAPP_ID: string;
  ENABLE_STABLE_POOLS: boolean;
  WALLET_SCREENING: boolean;
}
export default class ConfigService {
  public get env(): Env {
    return {
      APP_ENV: process.env.VUE_APP_ENV || 'development',
      NETWORK: networkId.value,
      APP_DOMAIN: process.env.VUE_APP_DOMAIN || 'app.balancer.fi',
      APP_HOST: process.env.VUE_APP_HOST || 'balancer.fi',
      IPFS_NODE: process.env.VUE_APP_IPFS_NODE || 'cloudflare-ipfs.com',
      BLOCKNATIVE_DAPP_ID:
        process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || 'MISSING_KEY',
      ALCHEMY_KEY:
        process.env.VUE_APP_ALCHEMY_KEY ||
        this.getNetworkConfig(networkId.value).keys.alchemy ||
        'MISSING_KEY',
      GRAPH_KEY:
        process.env.VUE_APP_ENV === 'development'
          ? process.env.VUE_APP_GRAPH_KEY_DEV || 'MISSING_KEY'
          : process.env.VUE_APP_GRAPH_KEY ||
            this.getNetworkConfig(networkId.value).keys.graph ||
            'MISSING_KEY',
      INFURA_PROJECT_ID:
        process.env.VUE_APP_INFURA_PROJECT_ID ||
        this.getNetworkConfig(networkId.value).keys.infura ||
        'MISSING_KEY',
      ENABLE_STABLE_POOLS: process.env.VUE_APP_ENABLE_STABLE_POOLS === 'true',
      PORTIS_DAPP_ID: process.env.VUE_APP_PORTIS_DAPP_ID || 'MISSING_KEY',
      WALLET_SCREENING: process.env.VUE_APP_WALLET_SCREENING === 'true',
    };
  }

  public get network(): Config {
    return configs[networkId.value];
  }

  public getNetworkConfig(key: Network): Config {
    if (!Object.keys(configs).includes(key?.toString()))
      throw new Error(`No config for network key: ${key}`);
    return configs[key];
  }

  public get rpc(): string {
    return template(this.network.rpc, {
      INFURA_KEY: this.env.INFURA_PROJECT_ID,
      ALCHEMY_KEY: this.env.ALCHEMY_KEY,
    });
  }

  public get subgraphUrls(): string[] | void {
    return this.network.subgraphs.main?.map(url => {
      if (url.includes('GRAPH_KEY')) {
        return template(url, {
          GRAPH_KEY: this.env.GRAPH_KEY,
        });
      }
      return url;
    });
  }

  public get ws(): string {
    return template(this.network.ws, {
      INFURA_KEY: this.env.INFURA_PROJECT_ID,
      ALCHEMY_KEY: this.env.ALCHEMY_KEY,
    });
  }

  public get loggingRpc(): string {
    return template(this.network.loggingRpc, {
      INFURA_KEY: this.env.INFURA_PROJECT_ID,
      ALCHEMY_KEY: this.env.ALCHEMY_KEY,
    });
  }
}

export const configService = new ConfigService();
