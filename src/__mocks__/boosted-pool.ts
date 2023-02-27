import { Pool, PoolType } from '@/services/pool/types';
import { mock } from 'vitest-mock-extended';

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

const pool: Pool = mock<Pool>();

const defaults: DeepPartial<Pool> = {
  id: '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d',
  address: '0xa13a9247ea42d743238089903570127dda72fe44',
  tokensList: [
    '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
    '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
    '0xa13a9247ea42d743238089903570127dda72fe44',
    '0xae37d54ae477268b9997d4161b96b8200755935c',
  ],
  symbol: 'bb-a-USD',
  name: 'Balancer Aave Boosted StablePool',
  totalLiquidity: '100',
  totalShares: '100',
  // Explicitly set mainIndex to undefined so that isSubPool works as expected
  mainIndex: undefined,
  tokens: [
    {
      address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
      balance: '34479736.617522694777495036',
      symbol: 'bb-a-USDT',
      token: {
        pool: {
          id: '0x2f4eb100552ef93840d5adc30560e5513dfffacb000000000000000000000334',
          totalShares: '50000000000.123456789101112131',
          address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
          poolType: PoolType.AaveLinear,
          mainIndex: 1,
          tokens: [
            {
              // USDT BPT
              address: '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
              symbol: 'bb-a-USDT',
            },
            {
              address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
              symbol: 'USDT',
            },
            {
              address: '0xf8fd466f12e236f4c96f7cce6c79eadb819abf58',
              balance: '24095652.502028',
              priceRate: '1',
              symbol: 'aUSDT',
            },
          ],
        },
      },
    },
    {
      address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
      symbol: 'bb-a-USDC',
      token: {
        pool: {
          address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
          poolType: PoolType.AaveLinear,
          mainIndex: 1,
          tokens: [
            {
              // USDC BPT
              address: '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
              symbol: 'bb-a-USDC',
            },
            {
              address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
              symbol: 'USDC',
            },
            {
              address: '0xd093fa4fb80d09bb30817fdcd442d4d02ed3e5de',
              symbol: 'aUSDC',
            },
          ],
        },
      },
    },
    {
      // Root BPT
      address: '0xa13a9247ea42d743238089903570127dda72fe44',
      symbol: 'bb-a-USD',
      token: {
        pool: {
          address: '0xa13a9247ea42d743238089903570127dda72fe44',
          poolType: PoolType.ComposableStable,
          mainIndex: 0,
        },
      },
    },
    {
      address: '0xae37d54ae477268b9997d4161b96b8200755935c',
      balance: '46694579.84496379152010581',
      symbol: 'bb-a-DAI',
      token: {
        pool: {
          totalShares: '50000000000.123456789101112131',
          address: '0xae37d54ae477268b9997d4161b96b8200755935c',
          poolType: PoolType.AaveLinear,
          mainIndex: 1,
          tokens: [
            {
              address: '0x02d60b84491589974263d922d9cc7a3152618ef6',
              balance: '25810645.481738532468751415',
              priceRate: '1',
              symbol: 'aDAI',
            },
            {
              address: '0x6b175474e89094c44da98b954eedeac495271d0f',
              balance: '18947250.406313118060126743',
              priceRate: '1',
              symbol: 'DAI',
            },
            {
              // DAI BPT
              address: '0xae37d54ae477268b9997d4161b96b8200755935c',
              symbol: 'bb-a-DAI',
            },
          ],
        },
      },
    },
  ],
};

export const BoostedPoolMock: Pool = Object.assign(pool, defaults);
