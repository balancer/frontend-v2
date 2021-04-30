import { merge } from 'lodash';

const defaultArgs = {
  first: 1000,
  where: {
    balance_gt: 0
  }
};

const defaultAttrs = {
  poolId: {
    id: true
  },
  balance: true
};

export default (args = {}, attrs = {}) => ({
  poolShares: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs)
  }
});
