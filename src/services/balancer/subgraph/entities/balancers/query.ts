import { merge } from 'lodash';

const defaultAttrs = {
  totalLiquidity: true,
  totalSwapFee: true,
  totalSwapVolume: true,
  poolCount: true
};

export default (args = {}, attrs = {}) => ({
  balancers: {
    __args: args,
    ...merge({}, defaultAttrs, attrs)
  }
});
