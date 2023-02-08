import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { StaticJsonRpcBatchProvider } from '@/services/rpc-provider/static-json-rpc-batch-provider';
import { mock } from 'vitest-mock-extended';
import { initRpcProviderService } from './rpc-provider.service';

export const rpcProviderServiceMock = mock<typeof rpcProviderService>();

//@ts-ignore
rpcProviderServiceMock.jsonProvider = {
  getBalance() {
    return 0;
  },
};

rpcProviderServiceMock.getJsonProvider.mockImplementation(() =>
  mock<StaticJsonRpcBatchProvider>()
);

export function generateRpcProviderServiceMock() {
  return rpcProviderServiceMock;
}

export function initRpcProviderServiceWithDefaultMocks() {
  initRpcProviderService(generateRpcProviderServiceMock());
}
