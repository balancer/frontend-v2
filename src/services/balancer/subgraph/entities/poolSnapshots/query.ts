import { merge } from 'lodash-es';

const defaultArgs = {
  first: 1000,
};

const defaultAttrs = {
  pool: {
    id: true,
  },
  liquidity: true,
  timestamp: true,
  amounts: true,
  totalShares: true,
  swapVolume: true,
  swapFees: true,
};

export default (args = {}, attrs = {}) => ({
  poolSnapshots: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
