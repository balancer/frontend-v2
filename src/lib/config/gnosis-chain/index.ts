import { Config } from '../types';
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
  visibleInUI: false,
  testNetwork: false,
  rpc: 'https://rpc.gnosischain.com',
  ws: 'wss://rpc.gnosischain.com/wss',
  publicRpc: 'https://rpc.gnosis.gateway.fm',
  explorer: 'https://gnosisscan.io',
  explorerName: 'Gnosisscan',
  balancerApi: 'https://api.sobal.fi',
  subgraph:
    'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gnosis-chain-v2',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gnosis-chain-v2',
    ],
    aave: '',
    gauge:
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges-gnosis-chain',
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
    minTransactionBuffer: '0.05',
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
  keys: {
    infura: 'daaa68ec242643719749dd1caba2fc66',
    alchemy: 'oGLgncMVHNWltnK0nTfiryxQ6gYemKQO',
  },
  gauges: {
    type: 2,
    weight: 100,
  },
  tokenlists,
  rateProviders,
};

export default config;
