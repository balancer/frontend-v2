import { Config } from '../types';
import contracts from './contracts';
import keys from './keys';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '1',
  chainId: 1,
  chainName: 'Ethereum',
  name: 'Ethereum Mainnet',
  shortName: 'Mainnet',
  monorepoName: 'mainnet',
  slug: 'ethereum',
  slugV3: 'ethereum',
  network: 'mainnet',
  trustWalletNetwork: 'ethereum',
  unknown: false,
  visibleInUI: true,
  testNetwork: false,
  rpc: `https://mainnet.infura.io/v3/${keys.infura}`,
  ws: ``,
  explorer: 'https://etherscan.io',
  explorerName: 'Etherscan',
  subgraph: `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/C4ayEZP2yTXRAB8vSaTrgN4m9anTe9Mdm2ViyiAuV9TV`,
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2:
    'https://storageapi.fleek.co/johngrantuk-team-bucket/poolsV2.json',
  subgraphs: {
    main: [
      `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/C4ayEZP2yTXRAB8vSaTrgN4m9anTe9Mdm2ViyiAuV9TV`,
    ],
    aave: `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/8wR23o1zkS4gpLqLNU4kG3JHYVucqGyopL5utGxP2q1N`,
    gauge: `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/4sESujoqmztX6pbichs4wZ1XXyYrkooMuHA8sKkYxpTn`,
    blocks: `https://gateway-arbitrum.network.thegraph.com/api/${keys.graph}/subgraphs/id/236pc6mnPH2EdGJxR5wunibyGsagq1JsSx5e2hx5tdoE`,
  },
  bridgeUrl: '',
  supportsEIP1559: true,
  supportsElementPools: true,
  blockTime: 12,
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
      platformId: 'ethereum',
    },
    apyVision: {
      networkName: 'eth',
    },
  },
  addresses: {
    ...contracts,
  },
  pools,
  tokens,
  keys,
  gauges: {
    type: 2,
    weight: 100,
  },
  tokenlists,
  rateProviders,
};

export default config;
