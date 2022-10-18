import { merge } from 'lodash';

import { POOLS } from '@/constants/pools';

const defaultArgs = {
  first: 1000,
  orderBy: 'totalLiquidity',
  orderDirection: 'desc',
  where: {
    totalShares_gt: 0.01,
    id_not_in: POOLS.BlockList,
  },
};

const tokenAttrs = {
  address: true,
  balance: true,
  weight: true,
  priceRate: true,
  symbol: true,
  decimals: true,
};

const poolAttrs = {
  id: true,
  poolType: true,
};

// Nested token tree attributes, 3 levels deep.
const tokenTreeAttrs = {
  ...tokenAttrs,
  token: {
    pool: {
      ...poolAttrs,
      tokens: {
        ...tokenAttrs,
        token: {
          pool: {
            ...poolAttrs,
            tokens: {
              ...tokenAttrs,
              token: {
                pool: {
                  ...poolAttrs,
                },
              },
            },
          },
        },
      },
    },
  },
};

const defaultAttrs = {
  id: true,
  address: true,
  poolType: true,
  swapFee: true,
  tokensList: true,
  totalLiquidity: true,
  totalSwapVolume: true,
  totalSwapFee: true,
  totalShares: true,
  owner: true,
  factory: true,
  amp: true,
  createTime: true,
  swapEnabled: true,
  symbol: true,
  name: true,
  tokens: tokenTreeAttrs,
};

export default (args = {}, attrs = {}) => ({
  pools: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
