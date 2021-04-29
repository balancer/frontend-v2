import { merge } from 'lodash';

const defaultPoolArgs = {
  first: 1000,
  where: {
    totalShares_gt: 0
  }
};

const defaultPoolAttrs = {
  id: true,
  poolType: true,
  swapFee: true,
  tokensList: true,
  totalLiquidity: true,
  totalSwapVolume: true,
  totalSwapFee: true,
  totalShares: true,
  tokens: {
    address: true,
    balance: true,
    weight: true
  }
};

export default {
  pools: (args = {}, attrs = {}) => ({
    pools: {
      __args: merge({}, defaultPoolArgs, args),
      ...merge({}, defaultPoolAttrs, attrs)
    }
  })
};
