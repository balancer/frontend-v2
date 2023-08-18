import { api } from '@/services/api/api.client';
import { configService } from '@/services/config/config.service';
import { mockDeep } from 'vitest-mock-extended';
import { initApi } from './balancer-api';

export const defaultTokenPrice = 1;

export const defaultPrices = {
  prices: [
    {
      address: '0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47',
      price: defaultTokenPrice,
    },
    {
      address: configService.network.addresses.veBAL,
      price: defaultTokenPrice,
    },
  ],
};

export const defaultVeBalVotingList = {
  veBalGetVotingList: [],
};

export function generateBalancerApiMock() {
  const apiMock = mockDeep<typeof api>();

  apiMock.GetCurrentTokenPrices.mockResolvedValue(defaultPrices);

  apiMock.VeBalGetVotingList.calledWith().mockResolvedValue(
    defaultVeBalVotingList
  );

  return apiMock;
}

export function initBalancerApiWithDefaultMocks() {
  initApi(generateBalancerApiMock());
}
