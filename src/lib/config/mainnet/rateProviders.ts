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
  '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110': {
    '0x387dBc0fB00b26fb085aa658527D5BE98302c84C': true,
  },
  '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7': {
    '0x746df66bc1bb361b9e8e2a794c299c3427976e6c': true,
  },
};

export default convertKeysToLowerCase(rateProviders);
