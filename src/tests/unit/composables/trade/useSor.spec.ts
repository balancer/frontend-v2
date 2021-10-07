import { ref, computed } from 'vue';
import useSor from '@/composables/trade/useSor';
import { configService } from '@/services/config/config.service';
import { mocked } from 'ts-jest/utils';
import { SorManager } from '@/lib/utils/balancer/helpers/sor/sorManager';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import BigNumber from 'bignumber.js';

jest.mock('@/lib/utils/balancer/helpers/sor/sorManager', () => {
  return {
    SorManager: jest.fn().mockImplementation(() => {
      return {
        setCostOutputToken: jest.fn().mockImplementation()
      };
    })
  };
});

jest.mock('@/lib/utils/balancer/helpers/sor/sorManager');

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

const mockNativeAssetAddress = configService.network.nativeAsset.address;
const mockEthPrice = 3000;
const mockTokenPrice = 0.2;

jest.mock('@/composables/useTokens', () => {
  return jest.fn().mockImplementation(() => {
    return {
      useTokens: jest.fn().mockImplementation(),
      priceFor: jest.fn().mockImplementation(address => {
        if (address === mockNativeAssetAddress) {
          return mockEthPrice;
        }
        return mockTokenPrice;
      })
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
      appNetworkConfig: {
        nativeAsset: {
          address: mockNativeAssetAddress
        }
      }
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

describe('setSwapCost', () => {
  const sorManager = new SorManager(
    false,
    rpcProviderService.jsonProvider,
    new BigNumber(1),
    1,
    1,
    '1',
    'source',
    'sg'
  );

  const mockedSorManager = mocked(sorManager);

  beforeEach(() => {
    mockedSorManager.setCostOutputToken.mockClear();
  });

  it('Should pass a correct gas price to sorManager', async () => {
    const sor = useSor(mockProps);

    const tokenAddress = '0x0';
    const tokenDecimals = 5;
    const expectedTokenPriceInEth = new BigNumber(
      mockEthPrice / mockTokenPrice
    );

    await sor.setSwapCost(tokenAddress, tokenDecimals, mockedSorManager as any);
    expect(mockedSorManager.setCostOutputToken).toBeCalledWith(
      tokenAddress,
      tokenDecimals,
      expectedTokenPriceInEth
    );
  });
});
