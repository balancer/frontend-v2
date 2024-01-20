import { convertKeysToLowerCase } from '@/lib/utils/objects';
import { RateProviders } from '../types';

const rateProviders: RateProviders = {
  '*': {
    '0x0000000000000000000000000000000000000000': true,
  },
  '0x8C7D118B5c47a5BCBD47cc51789558B98dAD17c5': {
    '0x4186BFC76E2E237523CBC30FD220FE055156b41F': true,
  },
};

export default convertKeysToLowerCase(rateProviders);
