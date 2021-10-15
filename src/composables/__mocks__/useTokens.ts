export default function useTokens() {
  return {
    injectTokens: jest.fn().mockImplementation(),
    priceFor: jest.fn().mockImplementation()
  };
}
