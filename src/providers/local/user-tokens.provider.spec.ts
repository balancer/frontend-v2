import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { mountComposableWithDefaultTokensProvider as mountComposable } from '@tests/mount-helpers';
import waitForExpect from 'wait-for-expect';
import { userTokensProvider } from './user-tokens.provider';

initDependenciesWithDefaultMocks();

async function mountUserTokensProvider() {
  const { result } = mountComposable(() => userTokensProvider());

  await waitForExpect(() => {
    expect(result.isLoadingBalances.value).toBeFalse();
  });

  return result;
}

const addressOfTokenWithoutBalance =
  '0xf76142b79db34e57852d68f9c52c0e24f7349647';

test('returns tokens with balance', async () => {
  const { tokensWithBalance } = await mountUserTokensProvider();
  expect(tokensWithBalance.value).toIncludeSameMembers([
    // List of tokens passed to useBalancesQuery in tokens.provider
    '0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47',
    '0x8c9e6c40d3402480ACE624730524fACC5482798c',
    '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE',
    '0xe0C9275E44Ea80eF17579d33c55136b7DA269aEb',
    '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
    '0x37f03a12241E9FD3658ad6777d289c3fb8512Bc9',
    '0x398106564948fEeb1fEdeA0709AE7D969D62a391',
    '0xA13a9247ea42D743238089903570127DdA72fE44',
    '0x2F4eb100552ef93840d5aDC30560E5513DFfFACb',
    '0x9eE0aF1Ee0a0782dAf5F1Af47fD49b2a766bd8d4',
    '0xae37D54Ae477268B9997d4161B96b8200755935c',
    '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7',
    '0x5cEA6A84eD13590ED14903925Fa1A73c36297d99',
    '0x0595D1Df64279ddB51F1bdC405Fe2D0b4Cc86681',
    '0xeFD681A82970AC5d980b9B2D40499735e7BF3F1F',
    '0x13ACD41C585d7EbB4a9460f7C8f50BE60DC080Cd',
    '0x829f35cEBBCd47d3c120793c12f7A232c903138B',
    '0xFF386a3d08f80AC38c77930d173Fa56C6286Dc8B',
    '0x89534a24450081Aa267c79B07411e9617D984052',
    '0x811151066392fd641Fe74A9B55a712670572D161',
    '0x4Cb1892FdDF14f772b2E39E299f44B2E5DA90d04',
    '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF',
  ]);
});

test('returns tokens with balance from a given address list', async () => {
  const { tokensWithBalanceFrom } = await mountUserTokensProvider();

  expect(
    tokensWithBalanceFrom([
      '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE',
      addressOfTokenWithoutBalance,
      '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1',
    ])
  ).toEqual([
    '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE',
    '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1',
  ]);
});

test('returns tokens with balance that are not in a given address list', async () => {
  const { tokensWithBalanceNotIn } = await mountUserTokensProvider();

  expect(
    tokensWithBalanceNotIn([
      '0x8c9e6c40d3402480ACE624730524fACC5482798c',
      addressOfTokenWithoutBalance,
    ])
  ).toIncludeSameMembers([
    '0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47',
    '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE',
    '0xe0C9275E44Ea80eF17579d33c55136b7DA269aEb',
    '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
    '0x37f03a12241E9FD3658ad6777d289c3fb8512Bc9',
    '0x398106564948fEeb1fEdeA0709AE7D969D62a391',
    '0xA13a9247ea42D743238089903570127DdA72fE44',
    '0x2F4eb100552ef93840d5aDC30560E5513DFfFACb',
    '0x9eE0aF1Ee0a0782dAf5F1Af47fD49b2a766bd8d4',
    '0xae37D54Ae477268B9997d4161B96b8200755935c',
    '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7',
    '0x5cEA6A84eD13590ED14903925Fa1A73c36297d99',
    '0x0595D1Df64279ddB51F1bdC405Fe2D0b4Cc86681',
    '0xeFD681A82970AC5d980b9B2D40499735e7BF3F1F',
    '0x13ACD41C585d7EbB4a9460f7C8f50BE60DC080Cd',
    '0x829f35cEBBCd47d3c120793c12f7A232c903138B',
    '0xFF386a3d08f80AC38c77930d173Fa56C6286Dc8B',
    '0x89534a24450081Aa267c79B07411e9617D984052',
    '0x811151066392fd641Fe74A9B55a712670572D161',
    '0x4Cb1892FdDF14f772b2E39E299f44B2E5DA90d04',
    '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF',
  ]);
});

test('returns tokens without balance from a given address list', async () => {
  const { tokensWithoutBalanceFrom } = await mountUserTokensProvider();

  expect(
    tokensWithoutBalanceFrom([
      '0x8c9e6c40d3402480ACE624730524fACC5482798c',
      addressOfTokenWithoutBalance,
    ])
  ).toEqual([addressOfTokenWithoutBalance]);
});
