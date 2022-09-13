import { merge } from 'lodash';

const defaultArgs = {
  first: 1,
  orderBy: 'timestamp',
  orderDirection: 'asc',
};

const defaultAttrs = {
  number: true,
};

export default (args = {}, attrs = {}) => ({
  blocks: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
