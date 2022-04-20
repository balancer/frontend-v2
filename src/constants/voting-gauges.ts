import { Network } from '@balancer-labs/sdk';

import { PoolToken, PoolType } from '@/services/balancer/subgraph/types';

export type VotingGauge = {
  address: string;
  network: Network;
  pool: {
    id: string;
    address: string;
    poolType: PoolType;
    symbol: string;
    tokens: Pick<PoolToken, 'address' | 'weight' | 'symbol'>[];
  };
  tokenLogoURIs: Record<string, string>;
};

export const KOVAN_VOTING_GAUGES: VotingGauge[] = [
  {
    address: '0xE190E5363C925513228Bf25E4633C8cca4809C9a',
    network: Network.KOVAN,
    pool: {
      id: '0x647c1fd457b95b75d0972ff08fe01d7d7bda05df000200000000000000000001',
      address: '0x647c1FD457b95b75D0972fF08FE01d7D7bda05dF',
      poolType: PoolType.Weighted,
      symbol: 'B-50WBTC-50WETH',
      tokens: [
        {
          address: '0x1C8E3Bcb3378a443CC591f154c5CE0EBb4dA9648',
          weight: '0.5',
          symbol: 'WBTC'
        },
        {
          address: '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x1C8E3Bcb3378a443CC591f154c5CE0EBb4dA9648':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
      '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x5E7B7B41377Ce4B76d6008F7a91ff9346551c853',
    network: Network.KOVAN,
    pool: {
      id: '0xf767f0a3fcf1eafec2180b7de79d0c559d7e7e370001000000000000000003e3',
      address: '',
      poolType: PoolType.Weighted,
      symbol: '17WBTC-50BAL-33USDC',
      tokens: [
        {
          address: '0x1c8e3bcb3378a443cc591f154c5ce0ebb4da9648',
          weight: '0.1667',
          symbol: 'WBTC'
        },
        {
          address: '0x41286bb1d3e870f3f750eb7e1c25d7e48c8a1ac7',
          weight: '0.5',
          symbol: 'BAL'
        },
        {
          address: '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115',
          weight: '0.3333',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x1c8e3bcb3378a443cc591f154c5ce0ebb4da9648':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
      '0x41286bb1d3e870f3f750eb7e1c25d7e48c8a1ac7':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xba100000625a3754423978a60c9317c58a424e3D/logo.png',
      '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
    }
  },
  {
    address: '0xf34D5E5715CC6CC9493f5bD252185E8acdc1De0d',
    network: Network.KOVAN,
    pool: {
      id: '0x8fd162f338b770f7e879030830cde9173367f3010000000000000000000004d8',
      address: '0x8fd162f338B770F7E879030830cDe9173367f301',
      poolType: PoolType.StablePhantom,
      symbol: 'bb-a-USD ',
      tokens: [
        {
          address: '0x0Bbd32B14A6503EE20F87df38Cf2d5d3b59eA2F5',
          weight: 'null',
          symbol: 'bb-a-USDC'
        },
        {
          address: '0xe667D48618e71c2a02E4a1B66Ed9dEf1426938b6',
          weight: 'null',
          symbol: 'bb-a-USDT'
        },
        {
          address: '0xfCCcB77A946b6a3BD59d149F083B5BfbB8004D6D',
          weight: 'null',
          symbol: 'bb-a-DAI'
        }
      ]
    },
    tokenLogoURIs: {
      '0x0Bbd32B14A6503EE20F87df38Cf2d5d3b59eA2F5':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x9210f1204b5a24742eba12f710636d76240df3d0.png',
      '0xe667D48618e71c2a02E4a1B66Ed9dEf1426938b6':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x2bbf681cc4eb09218bee85ea2a5d3d13fa40fc0c.png',
      '0xfCCcB77A946b6a3BD59d149F083B5BfbB8004D6D':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x804cdb9116a10bb78768d3252355a1b18067bf8f.png'
    }
  }
];

export const MAINNET_VOTING_GAUGES: VotingGauge[] = require('../../public/data/voting-gauges.json');
