import { merge } from 'lodash';

const defaultArgs = {
  first: 100,
  orderBy: 'timestamp',
  orderDirection: 'desc',
};

const defaultAttrs = {
  amounts: true,
  timestamp: true,
  tx: true,
  type: true,
};

export default (args = {}, attrs = {}) => ({
  joinExits: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
