import { Pool, PoolToken, PoolType } from '@/services/pool/types';
import { groAddress, wethAddress } from '@tests/unit/builders/address';
import { addOnChainToPoolData } from '@tests/unit/builders/pool.builders';
import { DeepPartial } from '@tests/unit/types';
import { mock } from 'vitest-mock-extended';

export const defaultWeightedPoolId =
  '0x45a0623ab66f985effc1c69d05f1af4badb01b00000200000000001230000060';

const pool: Pool = mock<Pool>();

export const defaultWeightedPoolAddress =
  '0x9ee0af1ee0a0782daf5f1af47fd49b2a766bd8d4';

// Used in tokens-5.json
export const defaultWeightedPoolSymbol = 'test-pool-symbol';

const defaults: DeepPartial<Pool> = {
  id: defaultWeightedPoolId,
  poolType: PoolType.Weighted,
  totalLiquidity: '100000000',
  address: defaultWeightedPoolAddress,
  owner: '0xb794f5ea0ba39494ce839613fffba74279579268',
  tokens: [
    aPoolToken({
      address: groAddress,
      symbol: 'GRO',
      balance: '408784.606604112667634055',
      weight: '0.8',
      token: {
        latestUSDPrice: '1.07',
        pool: null,
      },
    }),
    aPoolToken({
      address: wethAddress,
      symbol: 'WETH',
      balance: '95.094102533755196937',
      weight: '0.2',
      token: {
        latestUSDPrice: '1.07',
        pool: null,
      },
    }),
  ],
  tokensList: [groAddress, wethAddress],
};

export const PoolMock: Pool = Object.assign(pool, defaults);

export function aWeightedPool(options?: DeepPartial<Pool>) {
  let poolMock: Pool = Object.assign({}, pool, defaults);
  poolMock = addOnChainToPoolData(poolMock);
  return Object.assign({}, poolMock, options);
}

export function aPoolToken(options?: Partial<PoolToken>): PoolToken {
  const poolToken = mock<PoolToken>();
  return Object.assign({}, poolToken, options);
}
