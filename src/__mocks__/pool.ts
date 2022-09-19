import { Pool, PoolType } from '@/services/pool/types';

export const PoolMock: Pool = {
  onchain: {
    tokens: {
      '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7': {
        decimals: 18,
        balance: '408730.214628374105060109',
        weight: 0.8,
        symbol: 'GRO',
        name: 'Gro DAO Token',
        logoURI:
          'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x3ec8798b81485a254928b70cda1cf0a2bb0b74d7.png',
      },
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
        decimals: 18,
        balance: '95.094102533755196937',
        weight: 0.2,
        symbol: 'WETH',
        name: 'Wrapped Ether',
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      },
    },
    amp: '0',
    swapEnabled: true,
    totalSupply: '150501.891977546028526082',
    decimals: 18,
    swapFee: '0.0037',
  },
  symbol: 'GRO-WETH',
  address: '0x702605F43471183158938C1a3e5f5A359d7b31ba',
  createTime: 1633385013,
  name: 'GRO-WETH',
  factory: '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9',
  id: '0x702605f43471183158938c1a3e5f5a359d7b31ba00020000000000000000009f',
  owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  poolType: PoolType.Weighted,
  swapFee: '0.0037',
  tokens: [
    {
      address: '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7',
      balance: '408784.606604112667634055',
      priceRate: '1',
      weight: '0.8',
      token: { pool: null },
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      balance: '95.094102533755196937',
      priceRate: '1',
      weight: '0.2',
      token: { pool: { poolType: null } },
    },
  ],
  tokensList: [
    '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  ],
  totalLiquidity: '1203724.083931267693503729',
  totalShares: '150501.891977546028526082',
  totalSwapFee: '165820.9454823753843641664971705477',
  totalSwapVolume: '52262349.4122392298543195893618041',
};
