import { configService } from '@/services/config/config.service';

import { FeeDistributor } from './fee-distributor';

jest.mock('@/services/web3/web3.service');
jest.mock('@/services/rpc-provider/rpc-provider.service');

describe('FeeDistributor', () => {
  it('Instantiates the class', () => {
    const feeDistributor = new FeeDistributor(
      configService.network.addresses.feeDistributor
    );
    expect(feeDistributor).toBeTruthy();
  });
});
