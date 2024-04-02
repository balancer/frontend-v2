import { Config } from '../types';
import keys from './keys';
import contracts from './contracts';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '137',
  chainId: 137,
  layerZeroChainId: 109,
  chainName: 'Polygon PoS',
  name: 'Polygon Mainnet',
  shortName: 'Polygon',
  monorepoName: 'polygon',
  slug: 'polygon',
  network: 'polygon',
  trustWalletNetwork: 'polygon',
  unknown: false,
  visibleInUI: true,
  testNetwork: false,
  rpc: `https://polygon-mainnet.infura.io/v3/${keys.infura}`,
  ws: ``,
  publicRpc: 'https://polygon-rpc.com',
  explorer: 'https://polygonscan.com',
  explorerName: 'Polygonscan',
  subgraph:
    'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-prune-v2',
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-prune-v2',
    ],
    aave: 'https://api.thegraph.com/subgraphs/name/aave/aave-v2-matic',
    gauge:
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges-polygon',
    blocks: 'https://api.thegraph.com/subgraphs/name/ianlapham/polygon-blocks',
  },
  bridgeUrl: 'https://wallet.polygon.technology/polygon/bridge',
  supportsEIP1559: true,
  supportsElementPools: false,
  supportsVeBalSync: true,
  blockTime: 4,
  nativeAsset: {
    name: 'Matic',
    address: '0x0000000000000000000000000000000000001010',
    symbol: 'MATIC',
    decimals: 18,
    deeplinkId: 'matic',
    logoURI: 'tokens/matic.svg',
    minTransactionBuffer: '0.1',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'matic-network',
      platformId: 'polygon-pos',
    },
    apyVision: {
      networkName: 'matic',
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
