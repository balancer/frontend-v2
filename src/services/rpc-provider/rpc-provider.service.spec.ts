import RpcProviderService from '@/services/rpc-provider/rpc-provider.service';
import { StaticJsonRpcBatchProvider } from './static-json-rpc-batch-provider';

vi.mock('./static-json-rpc-batch-provider', () => {
  return {
    StaticJsonRpcBatchProvider: vi.fn().mockImplementation(() => {
      return {
        once: vi.fn(),
      };
    }),
  };
});

describe('RPC provider service', () => {
  const MockedStaticJsonRpcBatchProvider = vi.mocked(
    StaticJsonRpcBatchProvider,
    true
  );

  beforeEach(() => {
    MockedStaticJsonRpcBatchProvider.mockClear();
  });

  it('Instantiates the provider service', () => {
    const rpcProviderService = new RpcProviderService();
    expect(rpcProviderService).toBeTruthy();
  });

  it('Calls the JsonProvider constructor', () => {
    new RpcProviderService();
    expect(MockedStaticJsonRpcBatchProvider).toHaveBeenCalledTimes(1);
  });
});
