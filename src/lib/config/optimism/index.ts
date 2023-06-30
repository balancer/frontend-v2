import { Config } from '../types';
import contracts from './contracts';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';

const config: Config = {
  key: '10',
  chainId: 10,
  chainName: 'Optimism',
  name: 'Optimism Mainnet',
  shortName: 'Optimism',
  monorepoName: 'optimism',
  slug: 'optimism',
  network: 'optimism',
  trustWalletNetwork: 'optimism',
  unknown: false,
  visibleInUI: false,
  testNetwork: false,
  rpc: 'https://mainnet.optimism.io',
  ws: 'wss://ws-mainnet.optimism.io',
  blockTime: 13,
  explorer: 'https://optimistic.etherscan.io/',
  explorerName: 'The Optimism Explorer',
  subgraph:
    'https://api.thegraph.com/subgraphs/name/beethovenxfi/beethovenx-v2-optimism',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.thegraph.com/subgraphs/name/beethovenxfi/beethovenx-v2-optimism',
    ],
    aave: '',
    gauge:
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges-optimism',
    blocks: '',
    metadata:
      'https://api.thegraph.com/subgraphs/name/bleu-studio/balancer-pools-metadata-op',
  },
  bridgeUrl: '',
  supportsEIP1559: false,
  supportsElementPools: false,
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
      platformId: 'optimism',
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
  rateProviders: {},
};

export default config;
