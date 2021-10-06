import { ref, computed } from 'vue';
import useSor from '@/composables/trade/useSor';
import { UserSettingsProvider } from '@/providers';
import { configService } from '@/services/config/config.service';

jest.mock('@/locales', () => {
  return [];
});

jest.mock('@/services/rpc-provider/rpc-provider.service', () => {
  const RpcProviderService = jest.fn().mockImplementation(() => {
    return {
      _isProvider: true,
      getSigner: () => {
        return {
          _isSigner: true,
          getAddress: jest.fn().mockImplementation(() => {
            return '0x0';
          })
        };
      },
      initBlockListener: jest.fn().mockImplementation()
    };
  });

  return {
    rpcProviderService: new RpcProviderService()
  };
});

jest.mock('@/composables/useEthereumTxType', () => {
  return {
    EthereumTxType: {
      EIP1559: 'EIP1559'
    },
    ethereumTxType: {
      value: 'EIP1559'
    }
  };
});

jest.mock('@/composables/useUserSettings', () => {
  return jest.fn().mockImplementation(() => {
    return {
      useUserSettings: jest.fn().mockImplementation()
    };
  });
});

jest.mock('@/composables/useTokens', () => {
  return jest.fn().mockImplementation(() => {
    return {
      useTokens: jest.fn().mockImplementation()
    };
  });
});

jest.mock('@/composables/useEthers', () => {
  return jest.fn().mockImplementation(() => {
    return {
      txListener: jest.fn().mockImplementation()
    };
  });
});

jest.mock('@/composables/useTransactions', () => {
  return jest.fn().mockImplementation(() => {
    return {
      addTransaction: jest.fn().mockImplementation()
    };
  });
});

jest.mock('@/services/web3/useWeb3', () => {
  // const mockAppNetworkConfig = configService.network;
  return jest.fn().mockImplementation(() => {
    return {
      getProvider: jest.fn().mockImplementation(),
      isV1Supported: false,
      appNetworkConfig: {}
    };
  });
});

jest.mock('vue-i18n', () => {
  return {
    useI18n: jest.fn().mockImplementation(() => {
      return {
        t: jest.fn().mockImplementation()
      };
    })
  };
});

const mockTokenInfo = {
  chainId: 1,
  address: '0x0',
  name: 'mockTokenIn',
  decimals: 18,
  symbol: 'MTI'
};

const computedMockTokenInfo = computed(() => mockTokenInfo);

const mockProps = {
  exactIn: ref(false),
  tokenInAddressInput: ref('0x0'),
  tokenInAmountInput: ref('1'),
  tokenOutAddressInput: ref('0x0'),
  tokenOutAmountInput: ref('1'),
  tokens: ref({}),
  wrapType: ref(0),
  tokenIn: computedMockTokenInfo,
  tokenOut: computedMockTokenInfo,
  slippageBufferRate: computed(() => 1)
};

describe('useSor', () => {
  it('Should load', () => {
    const sorResult = useSor(mockProps);
    expect(sorResult).toBeTruthy();
  });
});

// describe('setSwapCost', () => {
//   it("Should pass a correct gas price to sorManager", () =>  {
//     const sor = useSor(mockProps);
//     const mockSorManager = jest.fn.mockImplementation();
//     sor.setSwapCost('0x0', 0, )
//   });
// })