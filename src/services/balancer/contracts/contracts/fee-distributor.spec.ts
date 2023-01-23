import { configService } from '@/services/config/config.service';

import { FeeDistributor } from './fee-distributor';

describe('FeeDistributor', () => {
  it('Instantiates the class', () => {
    const feeDistributor = new FeeDistributor(
      configService.network.addresses.feeDistributor
    );
    expect(feeDistributor).toBeTruthy();
  });
});
