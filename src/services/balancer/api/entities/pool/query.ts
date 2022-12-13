import { GraphQLArgs } from '@balancer-labs/sdk';
import { merge } from 'lodash';

const defaultArgs: GraphQLArgs = {
  where: {},
};

import { defaultAttrs } from '../pools/query';

export default (args = {}, attrs = {}) => ({
  args: merge({}, defaultArgs, args),
  attrs: merge({}, defaultAttrs, attrs),
});
