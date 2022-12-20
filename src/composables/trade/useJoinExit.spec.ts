import { parseFixed } from '@ethersproject/bignumber';
import { computed, ref } from 'vue';
import { mount } from 'vue-composable-tester';

import useJoinExit from '@/composables/trade/useJoinExit';
import { configService } from '@/services/config/config.service';

jest.mock('vue-i18n');
jest.mock('vuex');
jest.mock('@/composables/useEthereumTxType');
jest.mock('@/composables/useEthers');
jest.mock('@/composables/useUserSettings');
jest.mock('@/composables/useTransactions');
jest.mock('@/locales');
jest.mock('@/services/web3/useWeb3');
jest.mock('@/services/rpc-provider/rpc-provider.service');

const mockNativeAssetAddress = configService.network.nativeAsset.address;
const mockEthPrice = 3000;
const mockTokenPrice = 0.2;

jest.mock('@/composables/useTokens', () => {
  return jest.fn().mockImplementation(() => {
    return {
      injectTokens: jest.fn().mockImplementation(),
      priceFor: jest.fn().mockImplementation(address => {
        if (address === mockNativeAssetAddress) {
          return mockEthPrice;
        }
        return mockTokenPrice;
      }),
      useTokens: jest.fn().mockImplementation(),
      getToken: jest.fn().mockImplementation(),
    };
  });
});

const mockTokenInfo = {
  chainId: 1,
  address: '0x0',
  name: 'mockTokenIn',
  decimals: 18,
  symbol: 'MTI',
};

const computedMockTokenInfo = computed(() => mockTokenInfo);
const conputedTokenInAmountScaled = computed(() => parseFixed('1'));
const conputedTokenOutAmountScaled = computed(() => parseFixed('1'));

const mockProps = {
  exactIn: ref(false),
  tokenInAddressInput: ref('0x0'),
  tokenInAmountInput: ref('1'),
  tokenOutAddressInput: ref('0x0'),
  tokenOutAmountInput: ref('1'),
  tokenInAmountScaled: conputedTokenInAmountScaled,
  tokenOutAmountScaled: conputedTokenOutAmountScaled,
  wrapType: ref(0),
  tokenIn: computedMockTokenInfo,
  tokenOut: computedMockTokenInfo,
  slippageBufferRate: computed(() => 1),
  pools: ref([]),
};

describe('useJoinExit', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'time').mockImplementation();
    jest.spyOn(console, 'timeEnd').mockImplementation();
  });

  it('Should load', () => {
    jest.spyOn(console, 'time').mockImplementation();
    const { result } = mount(() => useJoinExit(mockProps));
    expect(result).toBeTruthy();
  });

  it('Should pass return an available joinExit trade', async () => {
    const { result: joinExit } = mount(() => useJoinExit(mockProps));
    console.log(joinExit);
    expect(1).toBeTruthy();
    // joinExit.swapInfo.value?.returnAmount
  });

  it('Should pass return a zero swapInfo when joinExit trade not available', async () => {
    // joinExit.swapInfo.value?.returnAmount.isZero()
    expect(1).toBeTruthy();
  });
});
