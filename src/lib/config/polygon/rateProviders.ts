import { convertKeysToLowerCase } from '@/lib/utils/objects';
import { RateProviders } from '../types';

const rateProviders: RateProviders = {
  '*': {
    '0x0000000000000000000000000000000000000000': true,
  },
  '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6': {
    '0xee652bbf72689aa59f0b8f981c9c90e2a8af8d8f': true,
  },
  '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4': {
    '0xded6c522d803e35f65318a9a4d7333a22d582199': true,
  },
};

export default convertKeysToLowerCase(rateProviders);
