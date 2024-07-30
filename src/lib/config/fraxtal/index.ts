import { Config } from '../types';
import contracts from './contracts';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '252',
  chainId: 252,
  layerZeroChainId: 255,
  chainName: 'Fraxtal',
  name: 'Fraxtal',
  shortName: 'Fraxtal',
  monorepoName: 'fraxtal',
  slug: 'fraxtal',
  slugV3: 'fraxtal',
  network: 'fraxtal',
  trustWalletNetwork: 'fraxtal',
  unknown: false,
  visibleInUI: true,
  testNetwork: false,
  rpc: 'https://rpc.frax.com/',
  ws: '',
  blockTime: 13,
  explorer: 'https://fraxscan.com/',
  explorerName: 'The Fraxtal Explorer',
  subgraph:
    'https://api.goldsky.com/api/public/project_clwhu1vopoigi01wmbn514m1z/subgraphs/balancer-fraxtal-v2/latest/gn',
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.goldsky.com/api/public/project_clwhu1vopoigi01wmbn514m1z/subgraphs/balancer-fraxtal-v2/latest/gn',
    ],
    aave: '',
    gauge:
      'https://api.goldsky.com/api/public/project_clwhu1vopoigi01wmbn514m1z/subgraphs/balancer-gauges-fraxtal/latest/gn',
    blocks: '',
  },
  bridgeUrl: '',
  supportsEIP1559: false,
  supportsElementPools: false,
  supportsVeBalSync: true,
  nativeAsset: {
    name: 'FraxEther',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'frxETH',
    decimals: 18,
    deeplinkId: 'ether',
    logoURI: 'tokens/eth.png',
    minTransactionBuffer: '0.005',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'frax-ether',
      platformId: 'fraxtal',
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
