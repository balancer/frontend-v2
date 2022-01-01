import { merge } from 'lodash';

const defaultArgs = {
  first: 300,
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
