import { merge } from 'lodash';

import { POOLS } from '@/constants/pools';
import { GraphQLArgs } from '@balancer-labs/sdk';

const defaultArgs: GraphQLArgs = {
  first: 1000,
  orderBy: 'totalLiquidity',
  orderDirection: 'desc',
  where: {
    totalShares: {
      gt: 0.01,
    },
    id: {
      not_in: POOLS.BlockList,
    },
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
  totalShares: true,
  address: true,
  poolType: true,
  mainIndex: true,
};

// Nested token tree attributes, 3 levels deep.
const tokenTreeAttrs = {
  ...tokenAttrs,
  token: {
    latestUSDPrice: true,
    pool: {
      ...poolAttrs,
      tokens: {
        ...tokenAttrs,
        token: {
          latestUSDPrice: true,
          pool: {
            ...poolAttrs,
            tokens: {
              ...tokenAttrs,
              token: {
                latestUSDPrice: true,
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

const priceRateProviderAttrs = {
  address: true,
  token: {
    address: true,
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
  protocolYieldFeeCache: true,
  priceRateProviders: priceRateProviderAttrs,
  tokens: tokenTreeAttrs,
  poolTypeVersion: true,
};

export default (args = {}, attrs = {}) => ({
  args: merge({}, defaultArgs, args),
  attrs: merge({}, defaultAttrs, attrs),
});
