import { merge } from 'lodash';

const defaultPoolArgs = {
  first: 1000,
  where: {
    totalShares_gt: 0
  }
};

export default {
  pools: args => ({
    pools: {
      __args: merge(defaultPoolArgs, args),
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
    }
  })
};
