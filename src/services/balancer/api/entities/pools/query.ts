import { GraphQLArgs } from '@balancer-labs/sdk';
import { POOLS } from '@/constants/pools';
import { merge } from 'lodash';

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

export const defaultAttrs = {
  pools: {
    id: true,
    address: true,
    poolType: true,
    swapFee: true,
    tokensList: true,
    totalLiquidity: true,
    totalSwapVolume: true,
    totalSwapFee: true,
    totalShares: true,
    volumeSnapshot: true,
    feesSnapshot: true,
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
    isNew: true,
    apr: {
      stakingApr: {
        min: true,
        max: true,
      },
      swapFees: true,
      tokenAprs: {
        total: true,
        breakdown: true,
      },
      rewardAprs: {
        total: true,
        breakdown: true,
      },
      protocolApr: true,
      min: true,
      max: true,
    },
  },
};

export default (args = {}, attrs = {}) => ({
  args: merge({}, defaultArgs, args),
  attrs: merge({}, defaultAttrs, attrs),
});
