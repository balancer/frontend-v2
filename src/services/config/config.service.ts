import { networkId } from '@/composables/useNetwork';
import { Config } from '@/lib/config/types';
import configs, { Network } from '@/lib/config';
import template from '@/lib/utils/template';

interface Env {
  APP_ENV: string;
  APP_DOMAIN: string;
  APP_HOST: string;
  API_URL: string;
  IPFS_NODE: string;
  BLOCKNATIVE_DAPP_ID: string;
  ALCHEMY_KEY: string;
  GRAPH_KEY: string;
  INFURA_PROJECT_ID: string;
  ENABLE_STABLE_POOLS: boolean;
  WALLET_SCREENING: boolean;
}
export default class ConfigService {
  public get env(): Env {
    return {
      APP_ENV: import.meta.env.VITE_ENV || 'development',
      APP_DOMAIN: import.meta.env.VITE_DOMAIN || 'app.sobal.fi',
      APP_HOST: import.meta.env.VITE_HOST || 'sobal.fi',
      API_URL:
        import.meta.env.VITE_API_URL || 'https://api-v3.sobal.fi/graphql',
      IPFS_NODE: import.meta.env.VITE_IPFS_NODE || 'cloudflare-ipfs.com',
      BLOCKNATIVE_DAPP_ID:
        import.meta.env.VITE_BLOCKNATIVE_DAPP_ID || 'MISSING_KEY',
      ALCHEMY_KEY:
        import.meta.env.VITE_ALCHEMY_KEY ||
        this.getNetworkConfig(networkId.value).keys.alchemy ||
        'MISSING_KEY',
      GRAPH_KEY:
        import.meta.env.VITE_ENV === 'development'
          ? import.meta.env.VITE_GRAPH_KEY_DEV || 'MISSING_KEY'
          : import.meta.env.VITE_GRAPH_KEY ||
            this.getNetworkConfig(networkId.value).keys.graph ||
            'MISSING_KEY',
      INFURA_PROJECT_ID:
        import.meta.env.VITE_INFURA_PROJECT_ID ||
        this.getNetworkConfig(networkId.value).keys.infura ||
        'MISSING_KEY',
      ENABLE_STABLE_POOLS: import.meta.env.VITE_ENABLE_STABLE_POOLS === 'true',
      WALLET_SCREENING: import.meta.env.VITE_WALLET_SCREENING === 'true',
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

  public getNetworkRpc(network: Network): string {
    const networkConfig = this.getNetworkConfig(network);

    return template(
      import.meta.env[`VITE_RPC_URL_${network}`] || networkConfig.rpc,
      {
        INFURA_KEY: networkConfig.keys.infura,
        ALCHEMY_KEY: networkConfig.keys.alchemy,
      }
    );
  }

  public get rpc(): string {
    return template(
      import.meta.env[`VITE_RPC_URL_${networkId.value}`] ||
        this.getNetworkConfig(networkId.value).rpc,
      {
        INFURA_KEY: this.env.INFURA_PROJECT_ID,
        ALCHEMY_KEY: this.env.ALCHEMY_KEY,
      }
    );
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
}

export const configService = new ConfigService();
