let mockPoolAddress = '0x0578292cb20a443ba1caaa59c985ce14ca2bdee5';

const mockTransactionResponse = {
  wait: jest.fn().mockImplementation(() => {
    const mockReceipt = {
      events: [
        {
          event: 'PoolCreated',
          args: [mockPoolAddress]
        }
      ]
    };
    return mockReceipt;
  })
};
const sendTransaction = jest.fn().mockImplementation(() => {
  return mockTransactionResponse;
});

function __setMockPoolAddress(address) {
  mockPoolAddress = address;
}

export { sendTransaction, __setMockPoolAddress };
