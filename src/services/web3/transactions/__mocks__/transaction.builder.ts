import { txResponseMock } from '@/__mocks__/transactions';

export const TransactionBuilder = jest.fn().mockImplementation(() => {
  return {
    contract: {
      sendTransaction: jest.fn().mockResolvedValue(txResponseMock),
    },
    raw: {
      sendTransaction: jest.fn().mockResolvedValue(txResponseMock),
    },
  };
});
