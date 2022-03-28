import { PoolToken, PoolType } from '@/services/balancer/subgraph/types';
import { Network } from '@balancer-labs/sdk';

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

export const MAINNET_VOTING_GAUGES: VotingGauge[] = [
  {
    address: '0x34f33CDaED8ba0E1CEECE80e5f4a73bcf234cfac',
    network: Network.MAINNET,
    pool: {
      id: '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
      address: '0x06Df3b2bbB68adc8B0e302443692037ED9f91b42',
      poolType: PoolType.Stable,
      symbol: 'staBAL3',
      tokens: [
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          weight: 'null',
          symbol: 'DAI'
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          weight: 'null',
          symbol: 'USDC'
        },
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          weight: 'null',
          symbol: 'USDT'
        }
      ]
    },
    tokenLogoURIs: {
      '0x6B175474E89094C44Da98b954EedeAC495271d0F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png'
    }
  },
  {
    address: '0x605eA53472A496c3d483869Fe8F355c12E861e19',
    network: Network.MAINNET,
    pool: {
      id: '0x072f14b85add63488ddad88f855fda4a99d6ac9b000200000000000000000027',
      address: '0x072f14B85ADd63488DDaD88f855Fda4A99d6aC9B',
      poolType: PoolType.Weighted,
      symbol: 'B-50SNX-50WETH',
      tokens: [
        {
          address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
          weight: '0.5',
          symbol: 'SNX'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x4ca6AC0509E6381Ca7CD872a6cdC0Fbf00600Fa1',
    network: Network.MAINNET,
    pool: {
      id: '0x0b09dea16768f0799065c475be02919503cb2a3500020000000000000000001a',
      address: '0x0b09deA16768f0799065C475bE02919503cB2a35',
      poolType: PoolType.Weighted,
      symbol: 'B-60WETH-40DAI',
      tokens: [
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.6',
          symbol: 'WETH'
        },
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          weight: '0.4',
          symbol: 'DAI'
        }
      ]
    },
    tokenLogoURIs: {
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png'
    }
  },
  {
    address: '0x5F4d57fd9Ca75625e4B7520c71c02948A48595d0',
    network: Network.MAINNET,
    pool: {
      id: '0x186084ff790c65088ba694df11758fae4943ee9e000200000000000000000013',
      address: '0x186084fF790C65088BA694Df11758faE4943EE9E',
      poolType: PoolType.Weighted,
      symbol: 'B-50WETH-50YFI',
      tokens: [
        {
          address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
          weight: '0.5',
          symbol: 'YFI'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x79eF6103A513951a3b25743DB509E267685726B7',
    network: Network.MAINNET,
    pool: {
      id: '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112',
      address: '0x1E19CF2D73a72Ef1332C882F20534B6519Be0276',
      poolType: PoolType.MetaStable,
      symbol: 'B-rETH-STABLE',
      tokens: [
        {
          address: '0xae78736Cd615f374D3085123A210448E74Fc6393',
          weight: 'null',
          symbol: 'rETH'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: 'null',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0xae78736Cd615f374D3085123A210448E74Fc6393':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0xae78736cd615f374d3085123a210448e74fc6393.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x5A481455E62D5825429C8c416f3B8D2938755B64',
    network: Network.MAINNET,
    pool: {
      id: '0x27c9f71cc31464b906e0006d4fcbc8900f48f15f00020000000000000000010f',
      address: '0x27C9f71cC31464B906E0006d4FcBC8900F48f15f',
      poolType: PoolType.Weighted,
      symbol: '80D2D-20USDC',
      tokens: [
        {
          address: '0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad',
          weight: '0.8',
          symbol: 'D2D'
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          weight: '0.2',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad.png',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
    }
  },
  {
    address: '0xcD4722B7c24C29e0413BDCd9e51404B4539D14aE',
    network: Network.MAINNET,
    pool: {
      id: '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080',
      address: '0x32296969Ef14EB0c6d29669C550D4a0449130230',
      poolType: PoolType.MetaStable,
      symbol: 'B-stETH-STABLE',
      tokens: [
        {
          address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
          weight: 'null',
          symbol: 'wstETH'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: 'null',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xb154d9D7f6C5d618c08D276f94239c03CFBF4575',
    network: Network.MAINNET,
    pool: {
      id: '0x350196326aeaa9b98f1903fb5e8fc2686f85318c000200000000000000000084',
      address: '0x350196326AEAA9b98f1903fb5e8fc2686f85318C',
      poolType: PoolType.Weighted,
      symbol: 'VBPT',
      tokens: [
        {
          address: '0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321',
          weight: '0.8',
          symbol: 'VITA'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xdB7D7C535B4081Bb8B719237bdb7DB9f23Cc0b83',
    network: Network.MAINNET,
    pool: {
      id: '0x3e5fa9518ea95c3e533eb377c001702a9aacaa32000200000000000000000052',
      address: '0x3e5FA9518eA95c3E533EB377C001702A9AaCAA32',
      poolType: PoolType.Weighted,
      symbol: 'B-50WETH-50USDT',
      tokens: [
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        },
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          weight: '0.5',
          symbol: 'USDT'
        }
      ]
    },
    tokenLogoURIs: {
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png'
    }
  },
  {
    address: '0xaB5ea78c8323212cC5736bfe4874557Bc778Bfbf',
    network: Network.MAINNET,
    pool: {
      id: '0x4bd6d86debdb9f5413e631ad386c4427dc9d01b20002000000000000000000ec',
      address: '0x4bd6D86dEBdB9F5413e631Ad386c4427DC9D01B2',
      poolType: PoolType.Stable,
      symbol: 'LPePyvWBTC-29APR22',
      tokens: [
        {
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          weight: 'null',
          symbol: 'WBTC'
        },
        {
          address: '0x49e9e169f0B661Ea0A883f490564F4CC275123Ed',
          weight: 'null',
          symbol: 'ePyvWBTC-29APR22'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
      '0x49e9e169f0B661Ea0A883f490564F4CC275123Ed': ''
    }
  },
  {
    address: '0x8F4a5C19A74D7111bC0e1486640F0aAB537dE5A1',
    network: Network.MAINNET,
    pool: {
      id: '0x51735bdfbfe3fc13dea8dc6502e2e958989429610002000000000000000000a0',
      address: '0x51735bdFBFE3fC13dEa8DC6502E2E95898942961',
      poolType: PoolType.Weighted,
      symbol: 'B-80UNN-20WETH',
      tokens: [
        {
          address: '0x226f7b842E0F0120b7E194D05432b3fd14773a9D',
          weight: '0.8',
          symbol: 'UNN'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x226f7b842E0F0120b7E194D05432b3fd14773a9D':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x226f7b842E0F0120b7E194D05432b3fd14773a9D/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xD61dc7452C852B866c0Ae49F4e87C38884AE231d',
    network: Network.MAINNET,
    pool: {
      id: '0x5d66fff62c17d841935b60df5f07f6cf79bd0f4700020000000000000000014c',
      address: '0x5d66FfF62c17D841935b60df5F07f6CF79Bd0F47',
      poolType: PoolType.Weighted,
      symbol: '50Silo-50WETH',
      tokens: [
        {
          address: '0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8',
          weight: '0.5',
          symbol: 'Silo'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x6f80310ca7f2c654691d1383149fa1a57d8ab1f8.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xC5f8B1de80145e3a74524a3d1a772a31eD2B50cc',
    network: Network.MAINNET,
    pool: {
      id: '0x5f7fa48d765053f8dd85e052843e12d23e3d7bc50002000000000000000000c0',
      address: '0x5f7FA48d765053F8dD85E052843e12D23e3D7BC5',
      poolType: PoolType.Weighted,
      symbol: 'NWWP',
      tokens: [
        {
          address: '0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5',
          weight: '0.5',
          symbol: 'NOTE'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0xcfeaead4947f0705a14ec42ac3d44129e1ef3ed5.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x7A89f34E976285b7b885b32b2dE566389C2436a0',
    network: Network.MAINNET,
    pool: {
      id: '0x702605f43471183158938c1a3e5f5a359d7b31ba00020000000000000000009f',
      address: '0x702605F43471183158938C1a3e5f5A359d7b31ba',
      poolType: PoolType.Weighted,
      symbol: 'B-80GRO-20WETH',
      tokens: [
        {
          address: '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7',
          weight: '0.8',
          symbol: 'GRO'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x3ec8798b81485a254928b70cda1cf0a2bb0b74d7.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x68d019f64A7aa97e2D4e7363AEE42251D08124Fb',
    network: Network.MAINNET,
    pool: {
      id: '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe',
      address: '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2',
      poolType: PoolType.StablePhantom,
      symbol: 'bb-a-USD',
      tokens: [
        {
          address: '0x2BBf681cC4eb09218BEe85EA2a5d3D13Fa40fC0C',
          weight: 'null',
          symbol: 'bb-a-USDT'
        },
        {
          address: '0x9210F1204b5a24742Eba12f710636D76240dF3d0',
          weight: 'null',
          symbol: 'bb-a-USDC'
        },
        {
          address: '0x804CdB9116a10bB78768D3252355a1b18067bF8f',
          weight: 'null',
          symbol: 'bb-a-DAI'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2BBf681cC4eb09218BEe85EA2a5d3D13Fa40fC0C':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x2bbf681cc4eb09218bee85ea2a5d3d13fa40fc0c.png',
      '0x9210F1204b5a24742Eba12f710636D76240dF3d0':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x9210f1204b5a24742eba12f710636d76240df3d0.png',
      '0x804CdB9116a10bB78768D3252355a1b18067bF8f':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x804cdb9116a10bb78768d3252355a1b18067bf8f.png'
    }
  },
  {
    address: '0x78DF155d6d75Ca2a1b1B2027f37414Ac1e7A1Ed8',
    network: Network.MAINNET,
    pool: {
      id: '0x7edde0cb05ed19e03a9a47cd5e53fc57fde1c80c0002000000000000000000c8',
      address: '0x7Edde0CB05ED19e03A9a47CD5E53fC57FDe1c80c',
      poolType: PoolType.Stable,
      symbol: 'LPePyvUSDC-29APR22',
      tokens: [
        {
          address: '0x52C9886d5D87B0f06EbACBEff750B5Ffad5d17d9',
          weight: 'null',
          symbol: 'ePyvUSDC-29APR22'
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          weight: 'null',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x52C9886d5D87B0f06EbACBEff750B5Ffad5d17d9': '',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
    }
  },
  {
    address: '0xc43d32BC349cea7e0fe829F53E26096c184756fa',
    network: Network.MAINNET,
    pool: {
      id: '0x8f4205e1604133d1875a3e771ae7e4f2b086563900020000000000000000010e',
      address: '0x8f4205e1604133d1875a3E771AE7e4F2b0865639',
      poolType: PoolType.Weighted,
      symbol: '50N/A-50N/A',
      tokens: [
        {
          address: '0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad',
          weight: '0.5',
          symbol: 'D2D'
        },
        {
          address: '0xba100000625a3754423978a60c9317c58a424e3D',
          weight: '0.5',
          symbol: 'BAL'
        }
      ]
    },
    tokenLogoURIs: {
      '0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad.png',
      '0xba100000625a3754423978a60c9317c58a424e3D':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xba100000625a3754423978a60c9317c58a424e3D/logo.png'
    }
  },
  {
    address: '0x4f9463405F5bC7b4C1304222c1dF76EFbD81a407',
    network: Network.MAINNET,
    pool: {
      id: '0x90291319f1d4ea3ad4db0dd8fe9e12baf749e84500020000000000000000013c',
      address: '0x90291319F1D4eA3ad4dB0Dd8fe9E12BAF749E845',
      poolType: PoolType.Weighted,
      symbol: 'B-30FEI-70WETH',
      tokens: [
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.7',
          symbol: 'WETH'
        },
        {
          address: '0x956F47F50A910163D8BF957Cf5846D573E7f87CA',
          weight: '0.3',
          symbol: 'FEI'
        }
      ]
    },
    tokenLogoURIs: {
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      '0x956F47F50A910163D8BF957Cf5846D573E7f87CA':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x956F47F50A910163D8BF957Cf5846D573E7f87CA/logo.png'
    }
  },
  {
    address: '0x9AB7B0C7b154f626451c9e8a68dC04f58fb6e5Ce',
    network: Network.MAINNET,
    pool: {
      id: '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019',
      address: '0x96646936b91d6B9D7D0c47C496AfBF3D6ec7B6f8',
      poolType: PoolType.Weighted,
      symbol: 'B-50USDC-50WETH',
      tokens: [
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          weight: '0.5',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
    }
  },
  {
    address: '0xE273d4aCC555A245a80cB494E9E0dE5cD18Ed530',
    network: Network.MAINNET,
    pool: {
      id: '0x96ba9025311e2f47b840a1f68ed57a3df1ea8747000200000000000000000160',
      address: '0x96bA9025311e2f47B840A1f68ED57A3DF1EA8747',
      poolType: PoolType.Weighted,
      symbol: '20DAI-80TCR',
      tokens: [
        {
          address: '0x9C4A4204B79dd291D6b6571C5BE8BbcD0622F050',
          weight: '0.8',
          symbol: 'TCR'
        },
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          weight: '0.2',
          symbol: 'DAI'
        }
      ]
    },
    tokenLogoURIs: {
      '0x9C4A4204B79dd291D6b6571C5BE8BbcD0622F050':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x9c4a4204b79dd291d6b6571c5be8bbcd0622f050.png',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png'
    }
  },
  {
    address: '0x4e311e207CEAaaed421F17E909DA16527565Daef',
    network: Network.MAINNET,
    pool: {
      id: '0xa02e4b3d18d4e6b8d18ac421fbc3dfff8933c40a00020000000000000000004b',
      address: '0xa02E4b3d18D4E6B8d18Ac421fBc3dfFF8933c40a',
      poolType: PoolType.Weighted,
      symbol: 'B-50MATIC-50WETH',
      tokens: [
        {
          address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
          weight: '0.5',
          symbol: 'MATIC'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x4E3c048BE671852277Ad6ce29Fd5207aA12fabff',
    network: Network.MAINNET,
    pool: {
      id: '0xa6f548df93de924d73be7d25dc02554c6bd66db500020000000000000000000e',
      address: '0xA6F548DF93de924d73be7D25dC02554c6bD66dB5',
      poolType: PoolType.Weighted,
      symbol: 'B-50WBTC-50WETH',
      tokens: [
        {
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          weight: '0.5',
          symbol: 'WBTC'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x055d483D00b0FFe0c1123c96363889Fb03fa13a4',
    network: Network.MAINNET,
    pool: {
      id: '0xbaeec99c90e3420ec6c1e7a769d2a856d2898e4d00020000000000000000008a',
      address: '0xBaeEC99c90E3420Ec6c1e7A769d2A856d2898e4D',
      poolType: PoolType.Weighted,
      symbol: 'B-50VITA-50WETH',
      tokens: [
        {
          address: '0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321',
          weight: '0.5',
          symbol: 'VITA'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x942CB1Ed80D3FF8028B3DD726e0E2A9671bc6202',
    network: Network.MAINNET,
    pool: {
      id: '0xbf96189eee9357a95c7719f4f5047f76bde804e5000200000000000000000087',
      address: '0xBF96189Eee9357a95C7719f4F5047F76bdE804E5',
      poolType: PoolType.Weighted,
      symbol: 'B-80LDO-20WETH ',
      tokens: [
        {
          address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
          weight: '0.8',
          symbol: 'LDO'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x5a98fcbea516cf06857215779fd812ca3bef1b32.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xbeC2d02008Dc64A6AD519471048CF3D3aF5ca0C5',
    network: Network.MAINNET,
    pool: {
      id: '0xe2469f47ab58cf9cf59f9822e3c5de4950a41c49000200000000000000000089',
      address: '0xe2469f47aB58cf9CF59F9822e3C5De4950a41C49',
      poolType: PoolType.Weighted,
      symbol: 'mBPT',
      tokens: [
        {
          address: '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2',
          weight: '0.8',
          symbol: 'MTA'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x31e7F53D27BFB324656FACAa69Fe440169522E1C',
    network: Network.MAINNET,
    pool: {
      id: '0xe99481dc77691d8e2456e5f3f61c1810adfc1503000200000000000000000018',
      address: '0xE99481DC77691d8E2456E5f3F61C1810adFC1503',
      poolType: PoolType.Weighted,
      symbol: 'B-50LINK-50WETH',
      tokens: [
        {
          address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
          weight: '0.8',
          symbol: 'LINK'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x514910771AF9Ca656af840dff83E8264EcF986CA':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xD6E4d70bdA78FBa018c2429e1b84153b9284298e',
    network: Network.MAINNET,
    pool: {
      id: '0xec60a5fef79a92c741cb74fdd6bfc340c0279b01000200000000000000000015',
      address: '0xeC60a5FeF79a92c741Cb74FdD6bfC340C0279B01',
      poolType: PoolType.Weighted,
      symbol: 'B-50REN-50WETH',
      tokens: [
        {
          address: '0x408e41876cCCDC0F92210600ef50372656052a38',
          weight: '0.5',
          symbol: 'REN'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x408e41876cCCDC0F92210600ef50372656052a38':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x408e41876cCCDC0F92210600ef50372656052a38/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x78259f2e946B11a0bE404d29d3cc017eCddE84C6',
    network: Network.MAINNET,
    pool: {
      id: '0xedf085f65b4f6c155e13155502ef925c9a756003000200000000000000000123',
      address: '0xEdf085f65b4F6c155e13155502Ef925c9a756003',
      poolType: PoolType.Stable,
      symbol: 'LPePyvDAI-29APR22',
      tokens: [
        {
          address: '0x2c72692E94E757679289aC85d3556b2c0f717E0E',
          weight: 'null',
          symbol: 'ePyvDAI-29APR22'
        },
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          weight: 'null',
          symbol: 'DAI'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2c72692E94E757679289aC85d3556b2c0f717E0E': '',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png'
    }
  },
  {
    address: '0xAFc28B2412B343574E8673D4fb6b220473677602',
    network: Network.MAINNET,
    pool: {
      id: '0xefaa1604e82e1b3af8430b90192c1b9e8197e377000200000000000000000021',
      address: '0xEFAa1604e82e1B3AF8430b90192c1B9e8197e377',
      poolType: PoolType.Weighted,
      symbol: 'B-50COMP-50WETH',
      tokens: [
        {
          address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
          weight: '0.5',
          symbol: 'COMP'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0xc00e94Cb662C3520282E6f5717214004A7f26888':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc00e94Cb662C3520282E6f5717214004A7f26888/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xCB664132622f29943f67FA56CCfD1e24CC8B4995',
    network: Network.MAINNET,
    pool: {
      id: '0xf4c0dd9b82da36c07605df83c8a416f11724d88b000200000000000000000026',
      address: '0xF4C0DD9B82DA36C07605df83c8a416F11724d88b',
      poolType: PoolType.Weighted,
      symbol: 'B-80GNO-20WETH',
      tokens: [
        {
          address: '0x6810e776880C02933D47DB1b9fc05908e5386b96',
          weight: '0.8',
          symbol: 'GNO'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x6810e776880C02933D47DB1b9fc05908e5386b96':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6810e776880C02933D47DB1b9fc05908e5386b96/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xf4339872Ad09B34a29Be76EE81D4F30BCf7dbf9F',
    network: Network.MAINNET,
    pool: {
      id: '0xf5aaf7ee8c39b651cebf5f1f50c10631e78e0ef9000200000000000000000069',
      address: '0xf5aAf7Ee8C39B651CEBF5f1F50C10631E78e0ef9',
      poolType: PoolType.Weighted,
      symbol: 'BPTUMAUSDC',
      tokens: [
        {
          address: '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828',
          weight: '0.5',
          symbol: 'UMA'
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          weight: '0.5',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828/logo.png',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
    }
  },
  {
    address: '0x57d40FF4cF7441A04A05628911F57bb940B6C238',
    network: Network.MAINNET,
    pool: {
      id: '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
      address: '0xFeadd389a5c427952D8fdb8057D6C8ba1156cC56',
      poolType: PoolType.Stable,
      symbol: 'staBAL3-BTC',
      tokens: [
        {
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          weight: 'null',
          symbol: 'WBTC'
        },
        {
          address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
          weight: 'null',
          symbol: 'renBTC'
        },
        {
          address: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
          weight: 'null',
          symbol: 'sBTC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
      '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D/logo.png',
      '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6.png'
    }
  }
];
