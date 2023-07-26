import { Config } from '../types';
import keys from './keys';
import contracts from './contracts';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '8453',
  chainId: 8453,
  chainName: 'Base',
  name: 'Base',
  shortName: 'Base',
  monorepoName: 'base',
  slug: 'base',
  network: 'base',
  trustWalletNetwork: 'base',
  unknown: false,
  visibleInUI: false,
  testNetwork: false,
  rpc: `https://developer-access-mainnet.base.org`,
  ws: ``,
  publicRpc: 'https://developer-access-mainnet.base.org',
  explorer: 'https://basescan.org/',
  explorerName: 'BaseScan',
  subgraph:
    'https://api.studio.thegraph.com/query/24660/balancer-base-v2/version/latest',
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.studio.thegraph.com/query/24660/balancer-base-v2/version/latest',
    ],
    aave: '',
    gauge: '',
    blocks: '',
  },
  bridgeUrl: 'bridge.base.org',
  supportsEIP1559: false,
  supportsElementPools: false,
  supportsVeBalSync: false,
  blockTime: 2,
  nativeAsset: {
    name: 'Ether',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    decimals: 18,
    deeplinkId: 'ether',
    logoURI: 'tokens/eth.png',
    minTransactionBuffer: '0.05',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'ethereum',
      platformId: 'base',
    },
  },
  addresses: {
    ...contracts,
  },
  pools,
  tokens,
  keys,
  gauges: {
    type: 3,
    weight: 0,
  },
  tokenlists,
  rateProviders,
};

export default config;
