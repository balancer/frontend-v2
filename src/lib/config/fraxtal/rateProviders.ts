import { convertKeysToLowerCase } from '@/lib/utils/objects';
import { RateProviders } from '../types';

const rateProviders: RateProviders = {
  '*': {
    '0x0000000000000000000000000000000000000000': true,
  },
  '0xFC00000000000000000000000000000000000005': {
    '0x761efEF0347E23e2e75907A6e2df0Bbc6d3A3F38': true,
  },
  '0xfc00000000000000000000000000000000000008': {
    '0x3893E8e1584fF73188034D37Fc6B7d41A255E570': true,
  },
};

export default convertKeysToLowerCase(rateProviders);
