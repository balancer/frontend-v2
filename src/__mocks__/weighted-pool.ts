import { Pool, PoolToken } from '@/services/pool/types';
import { mock } from 'vitest-mock-extended';

const pool: Pool = mock<Pool>();

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

const defaults: DeepPartial<Pool> = {
  totalLiquidity: '100000000',
  tokens: [
    aPoolToken({
      address: '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7',
      balance: '408784.606604112667634055',
      weight: '0.8',
      token: {
        latestUSDPrice: '1.07',
        pool: null,
      },
    }),
    aPoolToken({
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      balance: '95.094102533755196937',
      weight: '0.2',
      token: {
        latestUSDPrice: '1.07',
        pool: null,
      },
    }),
  ],
  tokensList: [
    '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  ],
};

export const PoolMock: Pool = Object.assign(pool, defaults);

export function aWeightedPool() {
  const poolMock: Pool = Object.assign(pool, defaults);
  return poolMock;
}

export function aPoolToken(options: Partial<PoolToken>): PoolToken {
  const poolToken = mock<PoolToken>();
  return Object.assign(poolToken, options);
}
