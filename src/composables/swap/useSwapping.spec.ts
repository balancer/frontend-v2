import { provide, ref } from 'vue';

import useSwapping from '@/composables/swap/useSwapping';
import { SwapInfo } from '@balancer-labs/sdk';

import * as useSor from '@/composables/swap/useSor';
import mockSorOutput from './__mocks__/mockSorOutput';
import { mountComposable } from '@tests/mount-helpers';
import { UserSettingsProviderSymbol } from '@/providers/user-settings.provider';
import { provideTokenLists } from '@/providers/token-lists.provider';
import { noop } from 'lodash';
import { initBalancer } from '@/dependencies/balancer-sdk';

vi.mock('@/services/web3/useWeb3');
vi.mock('@/composables/queries/useRelayerApprovalQuery');

vi.mock('@/services/web3/useWeb3', () => {
  return () => ({
    blockNumber: {
      _shallow: false,
      dep: {},
      __v_isRef: true,
      _value: 123,
    },
  });
});

const mockTokenInfoIn = {
  chainId: 5,
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
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

vi.mock('@/providers/tokens.provider', () => {
  const mockTokensOutput = { value: {} };

  return {
    useTokens: () => {
      return {
        injectTokens: vi.fn(noop),
        priceFor: vi.fn(noop),
        useTokens: vi.fn(noop),
        getToken: vi.fn(() => ({ value: mockTokenInfoIn })),
        tokens: mockTokensOutput,
      };
    },
  };
});

//TODO: FIX THIS
// const sorSwapInfoMock: SwapInfo = {
//   //@ts-ignore
//   returnAmount: {
//     _hex: '0x0a7e28f89bd8e08ee5',
//     isZero: () => false,
//   },
//   swaps: [
//     {
//       poolId:
//         '0x0578292cb20a443ba1cde459c985ce14ca2bdee5000100000000000000000269',
//       assetInIndex: 0,
//       assetOutIndex: 1,
//       amount: '626913885852279906',
//       userData: '0x',
//       returnAmount: '61358184778941658212',
//     },
//     {
//       poolId:
//         '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
//       assetInIndex: 0,
//       assetOutIndex: 2,
//       amount: '1373086114147720094',
//       userData: '0x',
//       returnAmount: '128435757025416503322',
//     },
//     {
//       poolId:
//         '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249',
//       assetInIndex: 2,
//       assetOutIndex: 1,
//       amount: '0',
//       userData: '0x',
//       returnAmount: '132200045154243418753',
//     },
//   ],
//   tokenAddresses: [
//     '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
//     '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
//     '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
//   ],
// };
// const balancerMock = generateBalancerSdkMock();
// balancerMock.sor.getSwaps.mockResolvedValue(sorSwapInfoMock);
// initBalancer(balancerMock);

initBalancer();

vi.mock('@/lib/balancer.sdk', () => {
  function mockSorSwapInfo(): SwapInfo {
    return {
      //@ts-ignore
      returnAmount: {
        _hex: '0x0a7e28f89bd8e08ee5',
        isZero: () => false,
      },
      swaps: [
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
      ],
      tokenAddresses: [
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
        '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
      ],
    };
  }
  return {
    balancer: {
      sor: {
        getSwaps: () => mockSorSwapInfo(),
      },
    },
  };
});

const mockProps = {
  exactIn: ref(true),
  tokenInAddressInput: ref(mockTokenInfoIn.address),
  tokenInAmountInput: ref('2'),
  tokenOutAddressInput: ref(mockTokenInfoOut.address),
  tokenOutAmountInput: ref('0'),
};

describe('useSwapping', () => {
  it('Should load', () => {
    const { result } = mountComposable(() =>
      useSwapping(
        mockProps.exactIn,
        mockProps.tokenInAddressInput,
        mockProps.tokenInAmountInput,
        mockProps.tokenOutAddressInput,
        mockProps.tokenOutAmountInput
      )
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
    const { result, vm } = mountComposable(callbackUnderTest, () => {
      provide(UserSettingsProviderSymbol, userSettingsResponse),
        provideTokenLists();
    });
    await vm.$nextTick();
    result.joinExit.handleAmountChange();
    await vm.$nextTick();
    expect(result.isJoinExitSwap.value).toBe(true);
  });
});
