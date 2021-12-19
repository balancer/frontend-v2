import { merge } from 'lodash';

const defaultAttrs = {
  id: true,
  tokenIn: true,
  tokenInSym: true,
  tokenOut: true,
  tokenOutSym: true,
  tokenAmountIn: true,
  tokenAmountOut: true,
  userAddress: {
    id: true
  },
  poolId: {
    id: true
  },
  timestamp: true
};

export default (args = {}, attrs = {}) => ({
  swaps: {
    __args: args,
    ...merge({}, defaultAttrs, attrs)
  }
});
