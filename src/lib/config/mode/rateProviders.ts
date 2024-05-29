import { convertKeysToLowerCase } from '@/lib/utils/objects';
import { RateProviders } from '../types';

const rateProviders: RateProviders = {
  // '*': {
  //   '0x0000000000000000000000000000000000000000': true,
  // },
  // '0x9Bcef72be871e61ED4fBbc7630889beE758eb81D': {
  //   '0x658843BB859B7b85cEAb5cF77167e3F0a78dFE7f': true,
  // },
  // '0x484c2D6e3cDd945a8B2DF735e079178C1036578c': {
  //   '0xf752dd899F87a91370C1C8ac1488Aef6be687505': true,
  // },
};

export default convertKeysToLowerCase(rateProviders);
