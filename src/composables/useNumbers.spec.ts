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

    it('Should not return decimal places for numbers > 1 if usd with noDecimals is specified', () => {
      const number = 3.28;
      const formattedNumber = fNum(number, 'usd', { noDecimals: true });
      expect(formattedNumber).toEqual('$3');
    });

    it('Should return 1 when the number is > 0.5 and < 1 and usd with noDecimals is specified', () => {
      const number = 0.887;
      const formattedNumber = fNum(number, 'usd', { noDecimals: true });
      expect(formattedNumber).toEqual('$1');
    });

    it('Should return 0 when the number is < 0.5 and usd with noDecimals is specified', () => {
      const number = 0.387;
      const formattedNumber = fNum(number, 'usd', { noDecimals: true });
      expect(formattedNumber).toEqual('$0');
    });

    it('Should return 0 when the number is 0 and usd with no decimals is specified', () => {
      const number = 0.0;
      const formattedNumber = fNum(number, 'usd', { noDecimals: true });
      expect(formattedNumber).toEqual('$0');
    });

  });

  describe('fNum2', () => {
    const { fNum, fNum2 } = result;

    const testNumbers = [
      '0',
      '0.0',
      '0.000005',
      '0.001',
      '0.123456789',
      '0.6',
      '1.3',
      '8',
      '13.44',
      '121',
      '188.9123',
      '5129.199911',
      '87654',
      '112124.8791743',
      '121237821371'
    ];

    it('BalLineChart percent formatter should give the same result', () => {
      testNumbers.forEach(testNumber => {
        const format1 = fNum(testNumber, null, { format: '0.00%' });
        const format2 = fNum2(testNumber, { style: 'unit', unit: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        expect(format2).toEqual(format1);
      });
    });

    it('BalLineChart USD formatter should give the same result', () => {
      testNumbers.forEach(testNumber => {
        const format1 = fNum(testNumber, null, { format: '$0,0.00' });
        const format2 = fNum2(testNumber, { style: 'currency', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        expect(format2).toEqual(format1);
      });
    });

    it('usd preset should give same result as style: currency', () => {
      testNumbers.forEach(testNumber => {
        const format1 = fNum(testNumber, 'usd');
        const format2 = fNum2(testNumber, { style: 'currency' });
        expect(format2).toEqual(format1);
      });
    });

    it('percent preset should give same result as unit: percent', () => {
      testNumbers.forEach(testNumber => {
        const format1 = fNum(testNumber, 'percent');
        const format2 = fNum2(testNumber, { style: 'unit', unit: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        expect(format2).toEqual(format1);
      });
    });

    it('PoolFees formatted percent should give the same result', () => {
      testNumbers.forEach(testNumber => {
        const format1 = fNum(testNumber, null, { format: '0.0%' });
        const format2 = fNum2(testNumber, { style: 'unit', unit: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
        expect(format2).toEqual(format1);
      });
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
  });
});
