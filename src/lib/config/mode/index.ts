import { Config } from '../types';
import contracts from './contracts';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '34443',
  chainId: 34443,
  layerZeroChainId: 260,
  chainName: 'Mode',
  name: 'Mode',
  shortName: 'Mode',
  monorepoName: 'mode',
  slug: 'mode',
  network: 'mode',
  trustWalletNetwork: 'mode',
  unknown: false,
  visibleInUI: true,
  testNetwork: false,
  rpc: 'https://1rpc.io/mode',
  ws: '',
  blockTime: 13,
  explorer: 'https://modescan.io/',
  explorerName: 'The Mode Explorer',
  subgraph:
    'https://api.studio.thegraph.com/proxy/75376/balancer-mode-v2/version/latest',
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.studio.thegraph.com/proxy/75376/balancer-mode-v2/version/latest',
    ],
    aave: '',
    gauge:
      'https://api.studio.thegraph.com/query/75376/balancer-gauges-mode/version/latest',
    blocks: '',
  },
  bridgeUrl: '',
  supportsEIP1559: false,
  supportsElementPools: false,
  supportsVeBalSync: true,
  nativeAsset: {
    name: 'Ether',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    decimals: 18,
    deeplinkId: 'ether',
    logoURI: 'tokens/eth.png',
    minTransactionBuffer: '0.005',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'ethereum',
      platformId: 'mode',
    },
  },
  addresses: {
    ...contracts,
  },
  keys: {
    infura: '',
    alchemy: '',
  },
  gauges: {
    type: 5,
    weight: 0,
  },
  pools,
  tokenlists,
  tokens,
  rateProviders,
};

export default config;
