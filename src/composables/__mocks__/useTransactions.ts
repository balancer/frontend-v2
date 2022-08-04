export default function useTransactions() {
  return {
    addTransaction: jest.fn().mockImplementation(),
  };
}
