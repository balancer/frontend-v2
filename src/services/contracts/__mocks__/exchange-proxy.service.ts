export default function ExchangeProxyService() {
  return {
    multihopBatchSwap: jest.fn().mockImplementation(),
    multihopBatchSwapExactIn: jest.fn().mockImplementation(),
    multihopBatchSwapExactOut: jest.fn().mockImplementation()
  };
}

export const exchangeProxyService = ExchangeProxyService();
