import { ref } from 'vue';
import { mount } from '@/tests/mount-composable-tester';

import useTrading from '@/composables/trade/useTrading';

jest.mock('vue-i18n');
jest.mock('@/locales');
jest.mock('@/services/web3/useWeb3');
jest.mock('@/composables/queries/useRelayerApprovalQuery');

jest.mock('@/providers/user-settings.provider', () => ({
  useUserSettings: () => {
    return {
      slippage: {
        value: '0.01',
      },
    };
  },
}));

jest.mock('@/services/web3/useWeb3', () => {
  return () => ({
    blockNumber: {
      _shallow: false,
      dep: {},
      __v_isRef: true,
      _rawValue: 123,
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

jest.mock('@/composables/trade/useSor');
jest.mock('@/composables/trade/useJoinExit');

jest.mock('@balancer-labs/sdk', () => {
  const mockSwapInfo = require('./__mocks__/mockSorSwapInfo.ts');
  return {
    someJoinExit: () => true,
    canUseJoinExit: () => true,
    balancer: {
      someJoinExit: () => true,
      sor: {
        getSwaps: () => mockSwapInfo.default(),
      },
    },
    Network: {
      MAINNET: 1,
      GOERLI: 5,
    },
    SwapTypes: {
      SwapExactIn: 0,
      SwapExactOut: 1,
    },
  };
});

jest.mock('@/providers/tokens.provider', () => {
  const mockTokensOutput = { value: {} };

  return {
    useTokens: () => {
      return {
        injectTokens: jest.fn().mockImplementation(),
        priceFor: jest.fn().mockImplementation(),
        useTokens: jest.fn().mockImplementation(),
        getToken: jest.fn(() => ({ value: mockTokenInfoIn })),
        tokens: mockTokensOutput,
      };
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

describe('useTrading', () => {
  it('Should load', () => {
    const { result } = mount(() =>
      useTrading(
        mockProps.exactIn,
        mockProps.tokenInAddressInput,
        mockProps.tokenInAmountInput,
        mockProps.tokenOutAddressInput,
        mockProps.tokenOutAmountInput
      )
    );
    expect(result).toBeTruthy();
  });

  it('Should confirm joinExit trade is available', async () => {
    const { result, vm } = mount(() =>
      useTrading(
        mockProps.exactIn,
        mockProps.tokenInAddressInput,
        mockProps.tokenInAmountInput,
        mockProps.tokenOutAddressInput,
        mockProps.tokenOutAmountInput
      )
    );
    await vm.$nextTick();
    result.joinExit.handleAmountChange();
    await vm.$nextTick();
    expect(result.isJoinExitTrade.value).toBe(true);
  });
});
