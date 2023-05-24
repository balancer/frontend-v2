import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { TokensResponse } from '@/providers/tokens.provider';
import { defaultTokenBalance } from '@/providers/__mocks__/tokens.provider.fake';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { aTokenInfo } from '@/types/TokenList.builders';
import { BoostedPoolMock } from '@/__mocks__/boosted-pool';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import {
  groAddress,
  nativeAssetAddress,
  wethAddress,
} from '@tests/unit/builders/address';
import { DeepPartial } from '@tests/unit/types';
import usePropMaxJoin from './usePropMaxJoin';

initDependenciesWithDefaultMocks();

async function mountUsePropMaxJoin(
  pool: Pool,
  tokensIn: TokenInfoMap,
  tokensProviderOverride?: DeepPartial<TokensResponse>
) {
  const { result } = await mountComposable(
    () => usePropMaxJoin(aWeightedPool(), ref(tokensIn)),
    { tokensProviderOverride }
  );
  return result;
}

function buildTokensIn() {
  return {
    [groAddress]: aTokenInfo({ address: groAddress }),
    [wethAddress]: aTokenInfo({ address: wethAddress }),
  };
}

test('Calculates the proportional maximum amounts in given the users token balances', async () => {
  const tokensIn = buildTokensIn();
  const result = await mountUsePropMaxJoin(BoostedPoolMock, tokensIn);

  expect(result.getPropMax()).toEqual([
    {
      address: groAddress,
      valid: true,
      value: defaultTokenBalance,
    },
    {
      address: wethAddress,
      valid: true,
      value: '10.0', //Formatted Default balance
    },
  ]);
});

test('When user does not have enough proportional balance in one token, it maxes the other tokens to that balance', async () => {
  const groBalance = '4';
  const wethBalance = '8';
  const tokensProviderOverride: DeepPartial<TokensResponse> = {
    balanceFor: address => {
      if (address === groAddress) return groBalance;
      if (address === wethAddress) return wethBalance;
      else return defaultTokenBalance;
    },
  };
  const tokensIn = buildTokensIn();

  const result = await mountUsePropMaxJoin(
    BoostedPoolMock,
    tokensIn,
    tokensProviderOverride
  );

  expect(result.getPropMax()).toEqual([
    {
      address: groAddress,
      valid: true,
      value: groBalance,
    },
    {
      address: wethAddress,
      valid: true,
      value: '4.0', // Instead of 8 uses 4 because user does not have enough proportional GRO balance
    },
  ]);
});

test('When using nativeAsset instead of wrapped native asset', async () => {
  const useNativeAsset = true;
  const tokensIn = buildTokensIn();

  const { result } = await mountComposable(() =>
    usePropMaxJoin(aWeightedPool(), ref(tokensIn), ref(useNativeAsset))
  );

  expect(result.getPropMax()).toEqual([
    {
      address: groAddress,
      valid: true,
      value: defaultTokenBalance,
    },
    {
      address: nativeAssetAddress,
      valid: true,
      value: '10.0', //Formatted Default balance
    },
  ]);
});
