import { WalletError } from '@/types';
import { isUserRejected } from './useTransactionErrors';

describe('useTransactionErrors', () => {
  describe('isUserRejected', () => {
    it('Should return false for a non-user error', () => {
      const error = new Error('Unsupported Exit Type For Pool');
      expect(isUserRejected(error)).toBe(false);
    });

    it('Should return true for common user rejection messages', () => {
      expect(isUserRejected(new Error('user rejected transaction'))).toBe(true);
      expect(isUserRejected(new Error('Request rejected'))).toBe(true);
      expect(isUserRejected(new Error('User rejected methods.'))).toBe(true);
      expect(isUserRejected(new Error('User rejected the transaction'))).toBe(
        true
      );
      expect(isUserRejected(new Error('Rejected by user'))).toBe(true);
      expect(isUserRejected(new Error('User canceled'))).toBe(true);
      expect(isUserRejected(new Error('Cancelled by User'))).toBe(true);
      expect(isUserRejected(new Error('Transaction declined'))).toBe(true);
      expect(isUserRejected(new Error('Transaction was rejected'))).toBe(true);
    });

    it('Should return true if the error message is in the cause', () => {
      const rejectionError = new Error('Something went wrong');
      rejectionError.cause = new Error('User rejected the transaction');
      expect(isUserRejected(rejectionError)).toBe(true);
    });

    it('Should return true if the error code is 4001', () => {
      const rejectionError = new Error('Something went wrong') as WalletError;
      rejectionError.code = 4001;
      expect(isUserRejected(rejectionError)).toBe(true);
    });
  });
});
