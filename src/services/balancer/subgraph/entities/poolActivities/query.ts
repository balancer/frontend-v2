import { merge } from 'lodash';

const defaultArgs = {
  first: 20
};

const defaultAttrs = {
  amounts: true,
  timestamp: true,
  tx: true
};

export default (args = {}, attrs = {}) => ({
  joins: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs)
  },
  exits: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs)
  }
});
