import { txResponseMock } from '@/__mocks__/transactions';

const BalancerMinter = vi.fn().mockImplementation(() => {
  return {
    mint: vi.fn().mockResolvedValue(txResponseMock),
    mintMany: vi.fn().mockResolvedValue(txResponseMock),
  };
});

export const balancerMinter = new BalancerMinter();
