import { convertKeysToLowerCase } from '@/lib/utils/objects';
import { RateProviders } from '../types';

const rateProviders: RateProviders = {
  '*': {
    '0x0000000000000000000000000000000000000000': true,
  },
  '0xd8143b8e7a6e452e5e1bc42a3cef43590a230031': {
    '0xd8143b8e7a6e452e5e1bc42a3cef43590a230031': true,
  },
  '0x24c52fee349194f68a998ac4e2ce170d780d010c': {
    '0x24c52fee349194f68a998ac4e2ce170d780d010c': true,
  },
  '0x594920068382f64e4bc06879679bd474118b97b1': {
    '0x594920068382f64e4bc06879679bd474118b97b1': true,
  },
  '0x335d8be85f65e33a46207bbfa72501528d934699': {
    '0xff31fdef65a015202b50bcda69dabf219309f0e5': true,
  },
  '0xc890a420afa924e907f18322487e73a2b21c7c95': {
    '0xff31fdef65a015202b50bcda69dabf219309f0e5': true,
  },
  '0x4d983081b9b9f3393409a4cdf5504d0aea9cd94c': {
    '0x4d983081b9b9f3393409a4cdf5504d0aea9cd94c': true,
  },
  '0xd03d4d8b4669d135569215dd6c4e790307c8e14b': {
    '0xd03d4d8b4669d135569215dd6c4e790307c8e14b': true,
  },
  '0x6320cd32aa674d2898a68ec82e869385fc5f7e2f': {
    '0x80a94f458491ca88f09767e58a92fd23cbf1196f': true,
  },
};

export default convertKeysToLowerCase(rateProviders);
