import { convertKeysToLowerCase } from '@/lib/utils/objects';
import { RateProviders } from '../types';

const rateProviders: RateProviders = {
  '*': {
    '0x0000000000000000000000000000000000000000': true,
  },
  '0x5979d7b546e38e414f7e9822514be443a4800529': {
    '0xf7c5c26b574063e7b098ed74fad6779e65e3f836': true,
  },
  '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': {
    '0xf7c5c26b574063e7b098ed74fad6779e65e3f836': true,
  },
  '0xb86fb1047a955c0186c77ff6263819b37b32440d': {
    '0x2ba447d4b823338435057571bf70907f8224bb47': true,
  },
  '0xe05a08226c49b636acf99c40da8dc6af83ce5bb3': {
    '0xfc8d81a01ded207ad3deb4fe91437cae52ded0b5': true,
  },
  '0xc757F12694F550d0985ad6E1019C4db4A803f160': {
    '0xf7c5c26b574063e7b098ed74fad6779e65e3f836': true,
    '0x320CFa1a78d37a13C5D1cA5aA51563fF6Bb0f686': true,
  },
};

export default convertKeysToLowerCase(rateProviders);
