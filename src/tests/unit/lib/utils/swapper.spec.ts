import { swapIn } from '@/lib/utils/balancer/swapper';
import RpcProviderService from '@/services/rpc-provider/rpc-provider.service';
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers';
import { mocked } from 'ts-jest/utils';
import { MockSorReturn } from '@/tests/unit/mocks/Sor';
import { BigNumber } from 'bignumber.js';
import { ethereumTxType } from '@/composables/useEthereumTxType';

jest.mock('@/services/rpc-provider/rpc-provider.service', () => {
  return jest.fn().mockImplementation(() => {
    return {
      _isProvider: true,
      getSigner: () => {
        return {
          _isSigner: true,
          getAddress: jest.fn().mockImplementation(() => {
            return '0x0';
          })
        };
      }
    };
  });
});

const mockGasLimitNumber = new BigNumber(1);

jest.mock('@ethersproject/contracts', () => {
  return {
    Contract: jest.fn().mockImplementation(() => {
      return {
        connect: () => {
          return {
            estimateGas: {
              batchSwap: jest.fn().mockImplementation(() => {
                return mockGasLimitNumber;
              })
            },
            batchSwap: jest.fn().mockImplementation(() => {
              return true;
            })
          };
        }
      };
    })
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

describe('Swapper Utils', () => {
  const MockedRpcProviderService = mocked(RpcProviderService, true);

  beforeEach(() => {
    MockedRpcProviderService.mockClear();
  });

  it('Should be able to call swapin', async () => {
    const result = await swapIn(
      '1',
      new RpcProviderService() as any,
      MockSorReturn(),
      new BigNumber(1),
      new BigNumber(1)
    );
    expect(result).toBeTruthy();
  });
});
