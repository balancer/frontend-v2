import { txResponseMock } from '@/__mocks__/transactions';

const BalancerMinter = jest.fn().mockImplementation(() => {
  return {
    mint: jest.fn().mockResolvedValue(txResponseMock),
    mintMany: jest.fn().mockResolvedValue(txResponseMock),
  };
});

export const balancerMinter = new BalancerMinter();
