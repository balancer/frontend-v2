import { merge } from 'lodash';

const defaultArgs = {
  first: 100,
};

const defaultAttrs = {
  id: true,
  address: true,
  metadataCID: true,
};

export const metadatasQueryBuilder = (
  args = {},
  attrs = {},
  name: string | undefined = undefined
) => ({
  __name: name,
  pools: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
