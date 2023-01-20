import { txResponseMock } from '@/__mocks__/transactions';

export const TransactionBuilder = vi.fn().mockImplementation(() => {
  return {
    contract: {
      sendTransaction: vi.fn().mockResolvedValue(txResponseMock),
    },
    raw: {
      sendTransaction: vi.fn().mockResolvedValue(txResponseMock),
    },
  };
});
