import { TokenListURLMap } from '@/types/TokenList';

const tokenlists: TokenListURLMap = {
  Balancer: {
    Allowlisted:
      'https://raw.githubusercontent.com/balancer/tokenlists/main/generated/balancer.tokenlist.json',
  },
  External: [
    'https://app.unpkg.com/@1hive/default-token-list@6.1.6/files/build/index.json',
  ],
};

export default tokenlists;
