import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { TokensResponse } from '@/providers/tokens.provider';
import { defaultBalance } from '@/providers/__mocks__/tokens.provider.fake';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { aTokenInfo } from '@/types/TokenList.builders';
import { BoostedPoolMock } from '@/__mocks__/boosted-pool';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { daiAddress } from '@tests/unit/builders/address';
import { DeepPartial } from '@tests/unit/types';
import usePropMaxJoin from './usePropMaxJoin';

initDependenciesWithDefaultMocks();

async function mountUsePropMaxJoin(
  pool: Pool,
  tokensIn: TokenInfoMap,
  tokensProviderOverride?: DeepPartial<TokensResponse>
) {
  const { result } = await mountComposable(
    () => usePropMaxJoin(BoostedPoolMock, ref(tokensIn)),
    { tokensProviderOverride }
  );
  return result;
}

test('Calculates the proportional maximum amounts in given the users token balances', async () => {
  const tokensIn = { [daiAddress]: aTokenInfo({ address: daiAddress }) };
  const result = await mountUsePropMaxJoin(BoostedPoolMock, tokensIn);

  expect(result.getPropMax()).toEqual([
    {
      address: daiAddress,
      valid: true,
      value: defaultBalance,
    },
  ]);
});

//TODO: finish this test
test('When user does not have enough balance', async () => {
  const daiBalance = '5';
  const tokensProviderOverride: DeepPartial<TokensResponse> = {
    balanceFor: address => {
      if (address === daiAddress) return daiBalance;
      else return defaultBalance;
    },
  };
  const tokensIn = { [daiAddress]: aTokenInfo({ address: daiAddress }) };
  const result = await mountUsePropMaxJoin(
    BoostedPoolMock,
    tokensIn,
    tokensProviderOverride
  );

  expect(result.getPropMax()).toEqual([
    {
      address: daiAddress,
      valid: true,
      value: daiBalance,
    },
  ]);
});

//TODO: missing tests for wNativeAsset
