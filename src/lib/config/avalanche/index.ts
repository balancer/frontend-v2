import { Config } from '../types';
import keys from './keys';
import contracts from './contracts';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '43114',
  chainId: 43114,
  chainName: 'Avalanche',
  name: 'Avalanche',
  shortName: 'Avalanche',
  monorepoName: 'avalanche',
  slug: 'avalanche',
  network: 'avalanche',
  unknown: false,
  visibleInUI: true,
  testNetwork: false,
  rpc: `https://avalanche-mainnet.infura.io/v3/${keys.infura}`,
  ws: `wss://avalanche-mainnet.g.alchemy.com/v2/${keys.alchemy}`,
  publicRpc: 'https://avalanche-mainnet.infura.io',
  explorer: 'https://snowtrace.io/',
  explorerName: 'Snowtrace',
  subgraph: '',
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2: '',
  subgraphs: {
    main: [''],
    aave: '',
    gauge: '',
    blocks: '',
  },
  bridgeUrl: 'https://core.app/bridge/',
  supportsEIP1559: false,
  supportsElementPools: false,
  blockTime: 2,
  nativeAsset: {
    name: 'AVAX',
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'AVAX',
    decimals: 18,
    deeplinkId: 'avax',
    logoURI: 'tokens/avax.svg',
    minTransactionBuffer: '0.1',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'avalanche-2',
      platformId: 'avalanche',
    },
    apyVision: {
      networkName: 'avalanche',
    },
  },
  addresses: {
    ...contracts,
  },
  pools,
  tokens,
  keys,
  gauges: {
    type: 4,
    weight: 0,
  },
  tokenlists,
  rateProviders,
};

export default config;
