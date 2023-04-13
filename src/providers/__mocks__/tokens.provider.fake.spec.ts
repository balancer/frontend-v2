import { sleep } from '@/lib/utils';
import { mount } from '@tests/mount-composable-tester';
import { daiAddress, wethAddress } from '@tests/unit/builders/address';
import {
  customFakeTokensProvider,
  defaultBalance,
  defaultPrice,
  fakeTokensProvider,
} from './tokens.provider.fake';

async function mountFakeTokensProvider() {
  const { result } = mount(() => fakeTokensProvider());
  // Wait for tokens list promise
  await sleep(5);
  return result;
}

test('Fakes provided state', async () => {
  const {
    nativeAsset,
    tokens,
    wrappedNativeAsset,
    activeTokenListTokens,
    balancerTokenListTokens,
    prices,
    balances,
    allowances,
  } = await mountFakeTokensProvider();

  expect(nativeAsset.address).toBe(
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  );

  expect(Object.keys(tokens.value)).toEqual([
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    '0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47', //BAL
    daiAddress,
    '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE', //USDT
    '0xe0C9275E44Ea80eF17579d33c55136b7DA269aEb', //USDC
    wethAddress,
    '0x37f03a12241E9FD3658ad6777d289c3fb8512Bc9', //WBTC
    '0x398106564948fEeb1fEdeA0709AE7D969D62a391', //miMATIC
    '0xA13a9247ea42D743238089903570127DdA72fE44', //bb-a-USD
    '0x2F4eb100552ef93840d5aDC30560E5513DFfFACb', //bb-a-USDT
    '0x82698aeCc9E28e9Bb27608Bd52cF57f704BD1B83', //bb-a-USDC
    '0xae37D54Ae477268B9997d4161B96b8200755935c', //b-a-DAI
  ]);

  expect(wrappedNativeAsset.value.address).toBe(wethAddress);

  expect(Object.keys(activeTokenListTokens.value)).toEqual([
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
  ]);

  expect(Object.keys(balancerTokenListTokens.value)).toEqual([
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
    '0x5cEA6A84eD13590ED14903925Fa1A73c36297d99',
    '0x0595D1Df64279ddB51F1bdC405Fe2D0b4Cc86681',
    '0xeFD681A82970AC5d980b9B2D40499735e7BF3F1F',
    '0x13ACD41C585d7EbB4a9460f7C8f50BE60DC080Cd',
    '0x829f35cEBBCd47d3c120793c12f7A232c903138B',
    '0xFF386a3d08f80AC38c77930d173Fa56C6286Dc8B',
    '0x89534a24450081Aa267c79B07411e9617D984052',
    '0x811151066392fd641Fe74A9B55a712670572D161',
    '0x4Cb1892FdDF14f772b2E39E299f44B2E5DA90d04',
  ]);

  expect(Object.keys(prices.value)).toEqual([]);
  expect(Object.keys(balances.value)).toEqual([]);
  expect(Object.keys(allowances.value)).toEqual([]);
});

test('Fakes provided methods', async () => {
  const {
    injectTokens,
    searchTokens,
    hasBalance,
    approvalRequired,
    approvalsRequired,
    priceFor,
    balanceFor,
    getTokens,
    getToken,
    injectPrices,
    injectedPrices,
    getMaxBalanceFor,
  } = await mountFakeTokensProvider();

  // Does not fail
  injectTokens(['0x811151066392fd641Fe74A9B55a712670572D161']);

  const foundTokens = await searchTokens('WETH', {});
  expect(Object.keys(foundTokens)).toEqual([wethAddress]);

  expect(hasBalance('any address')).toBeFalse();

  expect(approvalRequired(daiAddress, '100')).toBeTrue();

  const nativeAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  expect(approvalRequired(nativeAddress, '100')).toBeFalse();

  expect(approvalsRequired([daiAddress, wethAddress], ['50', '75'])).toEqual([
    daiAddress,
    wethAddress,
  ]);

  expect(priceFor('any address')).toBe(defaultPrice);
  expect(balanceFor('any address')).toBe(defaultBalance);

  const tokens = getTokens([daiAddress, wethAddress]);
  expect(Object.keys(tokens)).toEqual([daiAddress, wethAddress]);
  expect(tokens[daiAddress].name).toBe('Dai');
  expect(tokens[wethAddress].name).toBe('WETH');

  const token = getToken(daiAddress);
  expect(token.name).toBe('Dai');

  injectPrices({ [daiAddress]: 80 });
  expect(injectedPrices.value[daiAddress]).toBe(80);

  expect(getMaxBalanceFor(daiAddress)).toBe(defaultBalance);
});

test('Can be customized with override parameter', async () => {
  const { result } = mount(() =>
    customFakeTokensProvider({ priceFor: () => 125, balanceFor: () => '0.19' })
  );

  const { priceFor, balanceFor } = result;
  expect(priceFor(daiAddress)).toBe(125);
  expect(balanceFor(daiAddress)).toBe('0.19');
});
