import { Network } from '@balancer-labs/sdk';
import { networkId } from '@/composables/useNetwork';

const ALLOWED_RATE_PROVIDERS_MAP = {
  [Network.MAINNET]: {
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
  },
  [Network.GOERLI]: {
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
  },
  [Network.POLYGON]: {
    '*': {
      '0x0000000000000000000000000000000000000000': true,
    },
    '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6': {
      '0xee652bbf72689aa59f0b8f981c9c90e2a8af8d8f': true,
    },
    '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4': {
      '0xded6c522d803e35f65318a9a4d7333a22d582199': true,
    },
  },
  [Network.ARBITRUM]: {
    '*': {
      '0x0000000000000000000000000000000000000000': true,
    },
    '0x5979d7b546e38e414f7e9822514be443a4800529': {
      '0xf7c5c26b574063e7b098ed74fad6779e65e3f836': true,
    },
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': {
      '0xf7c5c26b574063e7b098ed74fad6779e65e3f836': true,
    },
  },
};

export const ALLOWED_RATE_PROVIDERS =
  ALLOWED_RATE_PROVIDERS_MAP[networkId.value];
