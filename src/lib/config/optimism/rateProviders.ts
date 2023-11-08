import { convertKeysToLowerCase } from '@/lib/utils/objects';
import { RateProviders } from '../types';

const rateProviders: RateProviders = {
  '*': {
    '0x0000000000000000000000000000000000000000': true,
  },
  '0x9Bcef72be871e61ED4fBbc7630889beE758eb81D': {
    '0x658843BB859B7b85cEAb5cF77167e3F0a78dFE7f': true,
  },
};

export default convertKeysToLowerCase(rateProviders);
