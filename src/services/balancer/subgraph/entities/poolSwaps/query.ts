import { merge } from 'lodash';

const defaultArgs = {
  first: 100,
  orderBy: 'timestamp',
  orderDirection: 'desc',
};

const defaultAttrs = {
  tokenIn: true,
  tokenOut: true,
  tokenAmountIn: true,
  tokenAmountOut: true,
  tx: true,
  timestamp: true,
  userAddress: {
    id: true,
  },
};

export default (args = {}, attrs = {}) => ({
  swaps: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
