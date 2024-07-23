import { Config } from '../types';
import keys from './keys';
import contracts from './contracts';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '100',
  chainId: 100,
  layerZeroChainId: 145,
  supportsVeBalSync: true,
  chainName: 'Gnosis Chain',
  name: 'Gnosis Chain',
  shortName: 'Gnosis',
  monorepoName: 'gnosis',
  slug: 'gnosis-chain',
  network: 'gnosis-chain',
  trustWalletNetwork: 'xdai',
  unknown: false,
  visibleInUI: true,
  testNetwork: false,
  rpc: 'https://gnosis-rpc.publicnode.com',
  ws: '',
  publicRpc: 'https://rpc.gnosis.gateway.fm',
  explorer: 'https://gnosisscan.io',
  explorerName: 'Gnosisscan',
  balancerApi: 'https://api.balancer.fi',
  subgraph: `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/EJezH1Cp31QkKPaBDerhVPRWsKVZLrDfzjrLqpmv6cGg`,
  poolsUrlV2: '',
  subgraphs: {
    main: [
      `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/EJezH1Cp31QkKPaBDerhVPRWsKVZLrDfzjrLqpmv6cGg`,
    ],
    aave: '',
    gauge: `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/HW5XpZBi2iYDLBqqEEMiRJFx8ZJAQak9uu5TzyH9BBxy`,
    blocks: '',
  },
  bridgeUrl: 'https://bridge.gnosischain.com/',
  supportsEIP1559: true,
  supportsElementPools: true,
  blockTime: 5,
  nativeAsset: {
    name: 'xDAI',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'xDAI',
    decimals: 18,
    deeplinkId: 'xdai',
    logoURI: 'tokens/xdai.png',
    minTransactionBuffer: '0.005',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'xdai',
      platformId: 'xdai',
    },
  },
  addresses: {
    ...contracts,
  },
  pools,
  tokens,
  keys: {},
  gauges: {
    type: 2,
    weight: 100,
  },
  tokenlists,
  rateProviders,
};

export default config;
