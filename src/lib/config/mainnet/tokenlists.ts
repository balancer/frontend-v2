import { TokenListURLMap } from '@/types/TokenList';

const tokenlists: TokenListURLMap = {
  Balancer: {
    Allowlisted:
      'https://raw.githubusercontent.com/balancer/tokenlists/main/generated/balancer.tokenlist.json',
  },
  External: [
    'https://tokens.uniswap.org/',
    'https://www.gemini.com/uniswap/manifest.json',
  ],
};

export default tokenlists;
