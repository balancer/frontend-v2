import { TokenListURLMap } from '@/types/TokenList';

const tokenlists: TokenListURLMap = {
  Balancer: {
    Default:
      'https://raw.githubusercontent.com/balancer/assets/master/generated/listed.tokenlist.json',
    Vetted:
      'https://raw.githubusercontent.com/balancer/assets/master/generated/vetted.tokenlist.json',
  },
  External: [
    'ipns://tokens.uniswap.org',
    'https://www.gemini.com/uniswap/manifest.json',
  ],
};

export default tokenlists;
