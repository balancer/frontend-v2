import useSwapping from '@/composables/swap/useSwapping';

import * as useSor from '@/composables/swap/useSor';
import { initBalancerSDK } from '@/dependencies/balancer-sdk';
import { initEthersContractWithDefaultMocks } from '@/dependencies/EthersContract.mocks';
import { initOldMulticallerWithDefaultMocks } from '@/dependencies/OldMulticaller.mocks';
import { provideTokenLists } from '@/providers/token-lists.provider';
import { UserSettingsProviderSymbol } from '@/providers/user-settings.provider';
import { BalancerSDK, SwapInfo } from '@sobal/sdk';
import { BigNumber } from '@ethersproject/bignumber';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { mock, mockDeep } from 'vitest-mock-extended';
import mockSorOutput from './__mocks__/mockSorOutput';
import { TokensResponse } from '@/providers/tokens.provider';
import { DeepPartial } from '@tests/unit/types';
import { wethAddress } from '@tests/unit/builders/address';

initOldMulticallerWithDefaultMocks();
initEthersContractWithDefaultMocks();

const mockTokenInfoIn = {
  chainId: 5,
  address: wethAddress,
  name: 'WETH',
  decimals: 18,
  symbol: 'WETH',
};
const mockTokenInfoOut = {
  chainId: 5,
  address: '0x616e8BfA43F920657B3497DBf40D6b1A02D4608d',
  name: 'auraBAL',
  decimals: 18,
  symbol: 'auraBAL',
};

vi.spyOn(useSor, 'default').mockImplementation(() => {
  return mockSorOutput;
});

const mockTokensOutput = { value: {} };
const tokensProviderOverride: DeepPartial<TokensResponse> = {
  getToken: () => mockTokenInfoIn,
  tokens: mockTokensOutput,
};

const swapInfoMock = mock<SwapInfo>();

swapInfoMock.returnAmount = BigNumber.from('0x0a7e28f89bd8e08ee5');
swapInfoMock.swaps = [
  {
    poolId:
      '0x0578292cb20a443ba1cde459c985ce14ca2bdee5000100000000000000000269',
    assetInIndex: 0,
    assetOutIndex: 1,
    amount: '626913885852279906',
    userData: '0x',
    returnAmount: '61358184778941658212',
  },
  {
    poolId:
      '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
    assetInIndex: 0,
    assetOutIndex: 2,
    amount: '1373086114147720094',
    userData: '0x',
    returnAmount: '128435757025416503322',
  },
  {
    poolId:
      '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249',
    assetInIndex: 2,
    assetOutIndex: 1,
    amount: '0',
    userData: '0x',
    returnAmount: '132200045154243418753',
  },
];
swapInfoMock.tokenAddresses = [
  wethAddress,
  '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
  '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
];

const balancerMock = mockDeep<BalancerSDK>();
balancerMock.sor.getSwaps.mockResolvedValue(swapInfoMock);
initBalancerSDK(balancerMock);

const mockProps = {
  exactIn: ref(true),
  tokenInAddressInput: ref(mockTokenInfoIn.address),
  tokenInAmountInput: ref('2'),
  tokenOutAddressInput: ref(mockTokenInfoOut.address),
  tokenOutAmountInput: ref('0'),
};

describe('useSwapping', () => {
  it('Should load', async () => {
    const { result } = await mountComposable(
      () =>
        useSwapping(
          mockProps.exactIn,
          mockProps.tokenInAddressInput,
          mockProps.tokenInAmountInput,
          mockProps.tokenOutAddressInput,
          mockProps.tokenOutAmountInput
        ),
      { tokensProviderOverride }
    );
    expect(result).toBeTruthy();
  });

  it('Should confirm joinExit swap is available', async () => {
    const userSettingsResponse = {
      slippage: {
        value: '0.01',
      },
    };

    const callbackUnderTest = () =>
      useSwapping(
        mockProps.exactIn,
        mockProps.tokenInAddressInput,
        mockProps.tokenInAmountInput,
        mockProps.tokenOutAddressInput,
        mockProps.tokenOutAmountInput
      );
    const { result } = await mountComposable(callbackUnderTest, {
      extraProvidersCb: () => {
        provide(UserSettingsProviderSymbol, userSettingsResponse),
          provideTokenLists();
      },
      tokensProviderOverride,
    });
    await result.joinExit.handleAmountChange();

    expect(result.isJoinExitSwap.value).toBe(true);
  });
});
