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
  tokens: {
    address: true,
    balance: true,
    weight: true,
    priceRate: true,
    symbol: true,
  },
};

export default (args = {}, attrs = {}) => ({
  args: merge({}, defaultArgs, args),
  attrs: merge({}, defaultAttrs, attrs),
});
