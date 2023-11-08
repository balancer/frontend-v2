import { convertKeysToLowerCase } from '@/lib/utils/objects';
import { RateProviders } from '../types';

const rateProviders: RateProviders = {
  '*': {
    '0x0000000000000000000000000000000000000000': true,
  },
  '0xae78736cd615f374d3085123a210448e74fc6393': {
    '0x1a8f81c256aee9c640e14bb0453ce247ea0dfe6f': true,
  },
  '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': {
    '0x72d07d7dca67b8a406ad1ec34ce969c90bfee768': true,
  },
  '0xa13a9247ea42d743238089903570127dda72fe44': {
    '0xa13a9247ea42d743238089903570127dda72fe44': true,
  },
  '0x24ae2da0f361aa4be46b48eb19c91e02c5e4f27e': {
    '0xf518f2ebea5df8ca2b5e9c7996a2a25e8010014b': true,
  },
};

export default convertKeysToLowerCase(rateProviders);
