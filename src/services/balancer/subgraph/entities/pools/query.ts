import { POOLS } from '@/constants/pools';
import { merge } from 'lodash';
import { configService } from '@/services/config/config.service';

const defaultArgs = {
  first: 1000,
  orderBy: 'totalLiquidity',
  orderDirection: 'desc',
  where: {
    totalShares_gt: 0.01,
    id_not_in: POOLS.BlockList
  }
};

if (!configService.env.ENABLE_STABLE_POOLS) {
  defaultArgs.where['poolType_not'] = 'Stable';
}

const defaultAttrs = {
  id: true,
  poolType: true,
  swapFee: true,
  tokensList: true,
  totalLiquidity: true,
  totalSwapVolume: true,
  totalSwapFee: true,
  totalShares: true,
  owner: true,
  factory: true,
  tokens: {
    address: true,
    balance: true,
    weight: true
  }
};

export default (args = {}, attrs = {}) => ({
  pools: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs)
  }
});
