import useTransactions from '@/composables/useTransactions';
import { MockedFunction } from 'vitest';

type UseTransactionsResponse = ReturnType<typeof useTransactions>;
type AddTransaction = UseTransactionsResponse['addTransaction'];

export const addTransactionMock: MockedFunction<AddTransaction> = vi.fn();

export default function useTransactionsMock() {
  return {
    addTransaction: addTransactionMock,
  };
}
