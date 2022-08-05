import { merge } from 'lodash';

import { POOLS } from '@/constants/pools';
import { Op, Pool, PoolQuery } from '@balancer-labs/sdk';

// const defaultArgs = {
//   first: 1000,
//   chainId: 1,
//   orderBy: 'totalLiquidity',
//   orderDirection: 'desc',
//   where: {
//     totalShares: {
//       gt: 0.01
//     },
//     id: {
//       not_in: POOLS.BlockList
//     }
//   }
// };

const defaultQuery = new PoolQuery({
  first: 1000,
  chainId: 1,
  orderBy: 'totalLiquidity',
  orderDirection: 'desc',
  where: [
    new Op.GreaterThan('totalShares', 0.01),
    new Op.NotIn('id', POOLS.BlockList)
  ]
}, {
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
  tokens: {
    address: true,
    balance: true,
    weight: true,
    priceRate: true,
    symbol: true,
  },
});

export default (query: PoolQuery): PoolQuery => {
  return defaultQuery.merge(query);
};
