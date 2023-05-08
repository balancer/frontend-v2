import { TokenListURLMap } from '@/types/TokenList';

const tokenlists: TokenListURLMap = {
  Balancer: {
    Default:
      'https://raw.githubusercontent.com/balancer/tokenlists/main/generated/listed-old.tokenlist.json',
    Vetted:
      'https://raw.githubusercontent.com/balancer/tokenlists/main/generated/balancer.tokenlist.json',
  },
  External: [],
};

export default tokenlists;
