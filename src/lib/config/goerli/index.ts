import contracts from './contracts';
import pools from './pools';
import keys from './keys';
import { Config } from '../types';

const config: Config = {
  key: '5',
  chainId: 5,
  chainName: 'Goerli',
  name: 'Ethereum Testnet Goerli',
  shortName: 'Goerli',
  slug: 'goerli',
  network: 'goerli',
  unknown: false,
  rpc: `https://goerli.infura.io/v3/${keys.infura}`,
  ws: `wss://goerli.infura.io/ws/v3/${keys.infura}`,
  explorer: 'https://goerli.etherscan.io',
  explorerName: 'Etherscan',
  subgraph:
    'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-goerli-v2',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-goerli-v2',
    ],
    aave: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2',
    gauge:
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges-goerli',
    blocks: 'https://api.thegraph.com/subgraphs/name/blocklytics/goerli-blocks',
  },
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
  addresses: {
    ...contracts,
  },
  pools,
  keys,
  gauges: {
    type: 2,
    weight: 100,
  },
};

export default config;
