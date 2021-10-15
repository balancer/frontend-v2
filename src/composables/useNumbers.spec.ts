import { FiatCurrency } from '@/constants/currency';
import { mount } from 'vue-composable-tester';
import useNumbers from './useNumbers';

const mockTokens = {
  ETH: {
    address: '0xEee',
    price: {
      usd: 3000,
      eur: 2500
    }
  }
};

const mockDefaultCurrency = FiatCurrency.usd;

jest.mock('@/composables/useTokens', () => {
  return jest.fn().mockImplementation(() => {
    return {
      priceFor: jest
        .fn()
        .mockImplementation((address, currency = mockDefaultCurrency) => {
          const token = Object.values(mockTokens).find(
            token => address === token.address
          );
          return token?.price[currency];
        })
    };
  });
});

describe('useNumbers', () => {
  const { result } = mount(() => useNumbers());

  it('Should load', () => {
    expect(result).toBeTruthy();
  });

  describe('fNum', () => {
    const { fNum } = result;

    it('Should format a number with default formatter when only a number is specified', () => {
      const number = 1234567.8912345;
      const formattedNumber = fNum(number);
      expect(formattedNumber).toEqual('1,234,568');
    });
  });

  describe('toFiat', () => {
    const { toFiat } = result;

    it('Should return the value of ETH in USD, when called without a currency', () => {
      const totalEth = 2.5;
      const expectedValue = (totalEth * mockTokens.ETH.price.usd).toString();
      const value = toFiat(totalEth, mockTokens.ETH.address);
      expect(value).toEqual(expectedValue);
    });

    it('Should return the value of ETH in EUR, when called with EUR', () => {
      const totalEth = 2.5;
      const expectedValue = (totalEth * mockTokens.ETH.price.eur).toString();
      const value = toFiat(totalEth, mockTokens.ETH.address, FiatCurrency.eur);
      expect(value).toEqual(expectedValue);
    });
  });
});
