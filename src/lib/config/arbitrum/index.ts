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
  chainName: 'Arbitrum',
  name: 'Arbitrum',
  shortName: 'Arbitrum',
  monorepoName: 'arbitrum',
  slug: 'arbitrum',
  slugV3: 'arbitrum',
  network: 'arbitrum-one',
  trustWalletNetwork: 'arbitrum',
  unknown: false,
  visibleInUI: true,
  testNetwork: false,
  rpc: `https://arbitrum-mainnet.infura.io/v3/${keys.infura}`,
  ws: ``,
  publicRpc: 'https://arb1.arbitrum.io/rpc',
  explorer: 'https://arbiscan.io',
  explorerName: 'Arbiscan',
  subgraph: `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/98cQDy6tufTJtshDCuhh9z2kWXsQWBHVh2bqnLHsGAeS`,
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/98cQDy6tufTJtshDCuhh9z2kWXsQWBHVh2bqnLHsGAeS`,
    ],
    aave: '',
    gauge: `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/Bb1hVjJZ52kL23chZyyGWJKrGEg3S6euuNa1YA6XRU4J`,
    blocks: `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/5jebsN6RBioFWQX7LP2N8r55nL4QPAyeKc6GzDA1Pt5H`,
  },
  bridgeUrl: 'https://bridge.arbitrum.io/',
  supportsEIP1559: false,
  supportsElementPools: false,
  supportsVeBalSync: true,
  blockTime: 2,
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
