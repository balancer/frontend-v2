import { merge } from 'lodash';

const defaultAttrs = {
  id: true,
  localUser: {
    id: true,
  },
  remoteUser: true,
  bias: true,
  slope: true,
  dstChainId: true,
};

export default (args = {}, attrs = {}) => ({
  omniVotingEscrowLocks: {
    __args: merge({}, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
