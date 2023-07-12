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

    // See https://balancer-labs.sentry.io/issues/4199718124/events/74a6db95ab424cd6a286af7a00076d2c/
    it('Should return true if the error is an object with a and b parameters', () => {
      const rejectionError = { a: -500, b: 'Cancelled by User' };
      expect(isUserRejected(rejectionError)).toBe(true);
    });

    // See https://balancer-labs.sentry.io/issues/4199718124/events/f1a41824e66141b4806c50db5f081f7b/
    it('Should return true if its a user error where they are out of gas', () => {
      const rejectionError = {
        code: 5002,
        message:
          "User rejected methods. Your wallet doesn't have enough Ethereum to start this transfer.",
      };
      expect(isUserRejected(rejectionError)).toBe(true);
    });

    // See https://balancer-labs.sentry.io/issues/4199718124/events/57d26b71647046f2be3620f3c0165714/
    it('Should return true if its a user error as an object', () => {
      const rejectionError = {
        code: 5001,
        message: 'User disapproved requested methods',
      };
      expect(isUserRejected(rejectionError)).toBe(true);
    });
  });
});
