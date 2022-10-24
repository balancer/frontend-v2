import { registerGlobalComponents } from '@/plugins/components';
import { TokensProviderSymbol } from '@/providers/tokens.provider';
import { Web3ProviderSymbol } from '@/services/web3/web3.plugin';
import { render, screen } from '@testing-library/vue';
import tokenLists from '@/tests/test-tokenlists.json';
import AssetRow from './AssetRow.vue';

jest.mock('@/services/web3/useWeb3');

const listedTokens =
  tokenLists[
    'https://raw.githubusercontent.com/balancer-labs/assets/master/generated/listed.tokenlist.json'
  ];

test('Shows balance and price for a given token', async () => {
  render(AssetRow, {
    global: {
      plugins: [registerGlobalComponents],
      provide: {
        [Web3ProviderSymbol as symbol]: {},
        [TokensProviderSymbol as symbol]: {
          getToken: address =>
            listedTokens.tokens.find(token => token.address === address),
          priceFor: () => 2,
        },
      },
    },
    props: {
      mainTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      address: '0xf8Fd466F12e236f4c96F7Cce6c79EAdB819abF58',
      balance: '24392820970327',
      priceRate: '1.094280477130783889',
      share: '0.999996864452977869',
    },
  });
  await screen.findByText('aUSDT');
  // Balance
  await screen.findByText('26,692,504');
  await screen.findByText('$53,385,008'); //balance x2 given that priceFor is mocked to be 2;
});
