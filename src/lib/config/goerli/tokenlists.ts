import { TokenListURLMap } from '@/types/TokenList';

const tokenlists: TokenListURLMap = {
  Balancer: {
    Default:
      'https://raw.githubusercontent.com/balancer/assets/refactor-for-multichain/generated/goerli.listed.tokenlist.json',
    Vetted:
      'https://raw.githubusercontent.com/balancer/assets/refactor-for-multichain/generated/goerli.vetted.tokenlist.json',
  },
  External: [],
};

export default tokenlists;
