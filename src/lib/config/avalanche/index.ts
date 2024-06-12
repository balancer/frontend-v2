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
  layerZeroChainId: 106,
  chainName: 'Avalanche',
  name: 'Avalanche',
  shortName: 'Avalanche',
  monorepoName: 'avalanche',
  slug: 'avalanche',
  network: 'avalanche',
  trustWalletNetwork: 'avalanchec',
  unknown: false,
  visibleInUI: true,
  testNetwork: false,
  rpc: `https://avalanche-mainnet.infura.io/v3/${keys.infura}`,
  ws: ``,
  publicRpc: 'https://avalanche.public-rpc.com',
  explorer: 'https://snowtrace.io',
  explorerName: 'Snowtrace',
  subgraph: `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/7asfmtQA1KYu6CP7YVm5kv4bGxVyfAHEiptt2HMFgkHu`,
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/7asfmtQA1KYu6CP7YVm5kv4bGxVyfAHEiptt2HMFgkHu`,
    ],
    aave: `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/EZvK18pMhwiCjxwesRLTg81fP33WnR6BnZe5Cvma3H1C`,
    gauge: `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/GzGBUh1X4Cq9RBdyKoCrPLhYW1saBYHwFBgcTsARPYUG`,
    blocks:
      'https://api.thegraph.com/subgraphs/name/iliaazhel/avalanche-blocks',
  },
  bridgeUrl: 'https://core.app/bridge/',
  supportsEIP1559: false,
  supportsElementPools: false,
  supportsVeBalSync: true,
  blockTime: 2,
  nativeAsset: {
    name: 'AVAX',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
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
