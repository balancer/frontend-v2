import { initRpcProviderService } from '@/dependencies/rpc-provider.service';
import { rpcProviderServiceMock } from '@/dependencies/rpc-provider.service.mocks';
import TokenService from './token.service';

it('Token service is built with a valid provider', () => {
  initRpcProviderService(rpcProviderServiceMock);

  const service = new TokenService();

  expect(service.provider.getBalance('any address')).toEqual(0);
});
