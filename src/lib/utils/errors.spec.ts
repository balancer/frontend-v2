import { WalletError } from '@/types';
import { isUserError } from './errors';

describe('useTransactionErrors', () => {
  describe('isUserError', () => {
    it('Should return false for a non-user error', () => {
      const error = new Error('Unsupported Exit Type For Pool');
      expect(isUserError(error)).toBe(false);
    });

    it('Should return true for common user rejection messages', () => {
      expect(isUserError(new Error('user rejected transaction'))).toBe(true);
      expect(isUserError(new Error('Request rejected'))).toBe(true);
      expect(isUserError(new Error('User rejected methods.'))).toBe(true);
      expect(isUserError(new Error('User rejected the transaction'))).toBe(
        true
      );
      expect(isUserError(new Error('Rejected by user'))).toBe(true);
      expect(isUserError(new Error('User canceled'))).toBe(true);
      expect(isUserError(new Error('Cancelled by User'))).toBe(true);
      expect(isUserError(new Error('Transaction declined'))).toBe(true);
      expect(isUserError(new Error('Transaction was rejected'))).toBe(true);
    });

    it('Should return true for common bad wallet config issues', () => {
      expect(isUserError(new Error('invalid rpc url'))).toBe(true);
      expect(isUserError(new Error('nonce has already been used'))).toBe(true);
    });

    it('Should return true if the error message is in the cause', () => {
      const rejectionError = new Error('Something went wrong');
      rejectionError.cause = new Error('User rejected the transaction');
      expect(isUserError(rejectionError)).toBe(true);
    });

    it('Should return true if the error code is 4001', () => {
      const rejectionError = new Error('Something went wrong') as WalletError;
      rejectionError.code = 4001;
      expect(isUserError(rejectionError)).toBe(true);
    });

    // See https://balancer-labs.sentry.io/issues/4199718124/events/74a6db95ab424cd6a286af7a00076d2c/
    it('Should return true if the error is an object with a and b parameters', () => {
      const rejectionError = { a: -500, b: 'Cancelled by User' };
      expect(isUserError(rejectionError)).toBe(true);
    });

    // See https://balancer-labs.sentry.io/issues/4199718124/events/f1a41824e66141b4806c50db5f081f7b/
    it('Should return true if its a user error where they are out of gas', () => {
      const rejectionError = {
        code: 5002,
        message:
          "User rejected methods. Your wallet doesn't have enough Ethereum to start this transfer.",
      };
      expect(isUserError(rejectionError)).toBe(true);
    });

    // See https://balancer-labs.sentry.io/issues/4327549689/events/0c8872a3076a4843bd7b836474160a44/
    it('Should return true if the not enough gas error is in russian', () => {
      const rejectionError = {
        message:
          'Комиссия за газ обновлена, и вам необходимо больше 0.00007039 ETH для завершения этой транзакции.',
      };
      expect(isUserError(rejectionError)).toBe(true);
    });

    // See https://balancer-labs.sentry.io/issues/4199718124/events/57d26b71647046f2be3620f3c0165714/
    it('Should return true if its a user error as an object', () => {
      const rejectionError = {
        code: 5001,
        message: 'User disapproved requested methods',
      };
      expect(isUserError(rejectionError)).toBe(true);
    });

    // See https://balancer-labs.sentry.io/issues/4327541491/events/9f490b42607646eb9065ebdd630226d2/
    it('Should return true if the cowswap fee has changed since the user received their quote', () => {
      const rejectionError = {
        message:
          "Error: The signed fee is insufficient. It's possible that is higher now due to a change in the gas price, ether price, or the sell token price. Please try again to get an updated fee quote.",
      };
      expect(isUserError(rejectionError)).toBe(true);
    });
  });
});
