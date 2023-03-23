import { TokenListURLMap } from '@/types/TokenList';

const tokenlists: TokenListURLMap = {
  Balancer: {
    Default:
      'https://raw.githubusercontent.com/balancer/assets/refactor-for-multichain/generated/arbitrum.listed.tokenlist.json',
    Vetted:
      'https://raw.githubusercontent.com/balancer/assets/refactor-for-multichain/generated/arbitrum.vetted.tokenlist.json',
  },
  External: [],
};

export default tokenlists;
