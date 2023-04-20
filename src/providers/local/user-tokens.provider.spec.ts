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

const addressOFTokenWithoutBalance =
  '0xf76142b79db34e57852d68f9c52c0e24f7349647';

test('returns tokens with balance', async () => {
  const { tokensWithBalance } = await mountUserTokensProvider();

  expect(tokensWithBalance.value).toEqual([
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
    '0x82698aeCc9E28e9Bb27608Bd52cF57f704BD1B83',
    '0xae37D54Ae477268B9997d4161B96b8200755935c',
    '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF',
  ]);
});

test('returns tokens with balance from a given address list', async () => {
  const { tokensWithBalanceFrom } = await mountUserTokensProvider();

  expect(
    tokensWithBalanceFrom([
      '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE',
      addressOFTokenWithoutBalance,
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
      addressOFTokenWithoutBalance,
    ])
  ).toEqual([
    '0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47',
    '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE',
    '0xe0C9275E44Ea80eF17579d33c55136b7DA269aEb',
    '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
    '0x37f03a12241E9FD3658ad6777d289c3fb8512Bc9',
    '0x398106564948fEeb1fEdeA0709AE7D969D62a391',
    '0xA13a9247ea42D743238089903570127DdA72fE44',
    '0x2F4eb100552ef93840d5aDC30560E5513DFfFACb',
    '0x82698aeCc9E28e9Bb27608Bd52cF57f704BD1B83',
    '0xae37D54Ae477268B9997d4161B96b8200755935c',
    '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF',
  ]);
});

test('returns tokens with balance that are not in a given address list', async () => {
  const { tokensWithoutBalanceFrom } = await mountUserTokensProvider();

  expect(
    tokensWithoutBalanceFrom([
      '0x8c9e6c40d3402480ACE624730524fACC5482798c',
      addressOFTokenWithoutBalance,
    ])
  ).toEqual([addressOFTokenWithoutBalance]);
});
