import { TokenListURLMap } from '@/types/TokenList';

const tokenlists: TokenListURLMap = {
  Balancer: {
    Default:
      'https://raw.githubusercontent.com/balancer/assets/refactor-for-multichain/generated/gnosis.listed.tokenlist.json',
    Vetted:
      'https://raw.githubusercontent.com/balancer/assets/refactor-for-multichain/generated/gnosis.vetted.tokenlist.json',
  },
  External: [
    'https://unpkg.com/@1hive/default-token-list@latest/build/honeyswap-default.tokenlist.json',
  ],
};

export default tokenlists;
