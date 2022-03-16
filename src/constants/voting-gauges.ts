import { PoolType } from '@/services/balancer/subgraph/types';
import { Network } from '@balancer-labs/sdk';

export type VotingGauge = {
  address: string;
  network: Network;
  pool: {
    id: string;
    poolType: PoolType;
    tokens: {
      address: string;
      weight: number | null;
      symbol: string;
    }[];
  };
};

export const KOVAN_VOTING_GAUGES: VotingGauge[] = [
  {
    address: '0x5BE3BBb5d7497138B9e623506D8b6C6cd72daceb',
    network: Network.KOVAN,
    pool: {
      id: '0x3a19030ed746bd1c3f2b0f996ff9479af04c5f0a000200000000000000000004',
      poolType: PoolType.Weighted,
      tokens: [
        {
          address: '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115',
          weight: 0.5,
          symbol: 'USDC'
        },
        {
          address: '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1',
          weight: 0.5,
          symbol: 'WETH'
        }
      ]
    }
  },
  {
    address: '0xF5E1F2Ae2a4CEEeB1786c650856fDA2a27796F87',
    network: Network.KOVAN,
    pool: {
      id: '0xf767f0a3fcf1eafec2180b7de79d0c559d7e7e370001000000000000000003e3',
      poolType: PoolType.Weighted,
      tokens: [
        {
          address: '0x1c8e3bcb3378a443cc591f154c5ce0ebb4da9648',
          weight: 0.1667,
          symbol: 'WBTC'
        },
        {
          address: '0x41286bb1d3e870f3f750eb7e1c25d7e48c8a1ac7',
          weight: 0.5,
          symbol: 'BAL'
        },
        {
          address: '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115',
          weight: 0.3333,
          symbol: 'USDC'
        }
      ]
    }
  },
  {
    address: '0x000000000000000000000000000000000Ba1DEF1',
    network: Network.POLYGON,
    pool: {
      id: '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068',
      poolType: PoolType.Stable,
      tokens: [
        {
          address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
          weight: null,
          symbol: 'USDT'
        },
        {
          address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
          weight: null,
          symbol: 'DAI'
        },
        {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          weight: null,
          symbol: 'USDC'
        }
      ]
    }
  }
];

export const MAINNET_VOTING_GAUGES: VotingGauge[] = [];
