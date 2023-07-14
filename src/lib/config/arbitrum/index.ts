import { Config } from '../types';
import keys from './keys';
import contracts from './contracts';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '42161',
  chainId: 42161,
  layerZeroChainId: 110,
  supportsVeBalSync: true,
  chainName: 'Arbitrum',
  name: 'Arbitrum',
  shortName: 'Arbitrum',
  monorepoName: 'arbitrum',
  slug: 'arbitrum',
  network: 'arbitrum-one',
  trustWalletNetwork: 'arbitrum',
  unknown: false,
  visibleInUI: false,
  testNetwork: false,
  rpc: `https://arbitrum-mainnet.infura.io/v3/${keys.infura}`,
  ws: `wss://arb-mainnet.g.alchemy.com/v2/${keys.alchemy}`,
  publicRpc: 'https://arb1.arbitrum.io/rpc',
  explorer: 'https://arbiscan.io',
  explorerName: 'Arbiscan',
  subgraph:
    'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2',
  balancerApi: 'https://api.sobal.fi',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2',
    ],
    aave: '',
    gauge:
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges-arbitrum',
    blocks:
      'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-one-blocks',
  },
  bridgeUrl: 'https://bridge.arbitrum.io/',
  supportsEIP1559: false,
  supportsElementPools: false,
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
      platformId: 'arbitrum-one',
    },
    apyVision: {
      networkName: 'arbitrum',
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
