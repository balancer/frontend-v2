import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import BigNumber from 'bignumber.js';
import useNumbers, { bspToDec, FNumFormats } from './useNumbers';

describe('useNumbers', async () => {
  const { result } = await mountComposable(() => useNumbers());

  it('Should load', () => {
    expect(result).toBeTruthy();
  });

  describe('fNum', () => {
    const { fNum } = result;

    const testNumbers = [
      {
        input: '-5678',
        formattedPercentage: '-567800.00%',
        withoutArgs: '0',
        formattedDollarValue: '-$5,678.00',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
        usdmPreset: '$0.00',
        percentPrecet: '0.00%',
        percentLgPreset: '0%',
        percentVariablePreset: '0%',
        formattedPercentageUnit: '-567800.0%',
        token: '0',
        tokenFixed: '0.0000',
        tokenLg: '0',
        basisPointsPercent: '0.00%',
        bpPercent: '0.00%',
      },
      {
        input: '-122.45',
        formattedPercentage: '-12245.00%',
        withoutArgs: '0',
        formattedDollarValue: '-$122.45',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
        usdmPreset: '$0.00',
        percentPrecet: '0.00%',
        percentLgPreset: '0%',
        percentVariablePreset: '0%',
        formattedPercentageUnit: '-12245.0%',
        token: '0',
        tokenFixed: '0.0000',
        tokenLg: '0',
        basisPointsPercent: '0.00%',
        bpPercent: '0.00%',
      },
      {
        input: '-1',
        formattedPercentage: '-100.00%',
        withoutArgs: '0',
        formattedDollarValue: '-$1.00',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
        usdmPreset: '$0.00',
        percentPrecet: '0.00%',
        percentLgPreset: '0%',
        percentVariablePreset: '0%',
        formattedPercentageUnit: '-100.0%',
        token: '0',
        tokenFixed: '0.0000',
        tokenLg: '0',
        basisPointsPercent: '0.00%',
        bpPercent: '0.00%',
      },
      {
        input: '-0.0078',
        formattedPercentage: '-0.78%',
        withoutArgs: '0',
        formattedDollarValue: '-$0.01',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
        usdmPreset: '$0.00',
        percentPrecet: '0.00%',
        percentLgPreset: '0%',
        percentVariablePreset: '0%',
        formattedPercentageUnit: '-0.8%',
        token: '0',
        tokenFixed: '0.0000',
        tokenLg: '0',
        basisPointsPercent: '0.00%',
        bpPercent: '0.00%',
      },
      {
        input: '-0.1',
        formattedPercentage: '-10.00%',
        withoutArgs: '0',
        formattedDollarValue: '-$0.10',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
        usdmPreset: '$0.00',
        percentPrecet: '0.00%',
        percentLgPreset: '0%',
        percentVariablePreset: '0%',
        formattedPercentageUnit: '-10.0%',
        token: '0',
        tokenFixed: '0.0000',
        tokenLg: '0',
        basisPointsPercent: '0.00%',
        bpPercent: '0.00%',
      },
      {
        input: '-0.0000443',
        formattedPercentage: '0.00%',
        withoutArgs: '0',
        formattedDollarValue: '$0.00',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
        usdmPreset: '$0.00',
        percentPrecet: '0.00%',
        percentLgPreset: '0%',
        percentVariablePreset: '0%',
        formattedPercentageUnit: '0.0%',
        token: '0',
        tokenFixed: '0.0000',
        tokenLg: '0',
        basisPointsPercent: '0.00%',
        bpPercent: '0.00%',
      },
      {
        input: '0',
        formattedPercentage: '0.00%',
        withoutArgs: '0',
        formattedDollarValue: '$0.00',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
        usdmPreset: '$0.00',
        percentPrecet: '0.00%',
        percentLgPreset: '0%',
        percentVariablePreset: '0%',
        formattedPercentageUnit: '0.0%',
        token: '0',
        tokenFixed: '0.0000',
        tokenLg: '0',
        basisPointsPercent: '0.00%',
        bpPercent: '0.00%',
      },
      {
        input: '0.0',
        formattedPercentage: '0.00%',
        withoutArgs: '0',
        formattedDollarValue: '$0.00',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
        usdmPreset: '$0.00',
        percentPrecet: '0.00%',
        percentLgPreset: '0%',
        percentVariablePreset: '0%',
        formattedPercentageUnit: '0.0%',
        token: '0',
        tokenFixed: '0.0000',
        tokenLg: '0',
        basisPointsPercent: '0.00%',
        bpPercent: '0.00%',
      },
      {
        input: '0.0000',
        formattedPercentage: '0.00%',
        withoutArgs: '0',
        formattedDollarValue: '$0.00',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
        usdmPreset: '$0.00',
        percentPrecet: '0.00%',
        percentLgPreset: '0%',
        percentVariablePreset: '0%',
        formattedPercentageUnit: '0.0%',
        token: '0',
        tokenFixed: '0.0000',
        tokenLg: '0',
        basisPointsPercent: '0.00%',
        bpPercent: '0.00%',
      },
      {
        input: '0.000005',
        formattedPercentage: '< 0.01%',
        withoutArgs: '0',
        formattedDollarValue: '$0.00',
        bpPercentageOutput: '< 0.01%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
        usdmPreset: '$0.00',
        percentPrecet: '< 0.01%',
        percentLgPreset: '< 0.01%',
        percentVariablePreset: '< 0.01%',
        formattedPercentageUnit: '< 0.01%',
        token: '< 0.0001',
        tokenFixed: '< 0.0001',
        tokenLg: '0',
        basisPointsPercent: '< 0.01%',
        bpPercent: '< 0.01%',
      },
      {
        input: '0.001',
        formattedPercentage: '0.10%',
        withoutArgs: '0',
        formattedDollarValue: '$0.00',
        bpPercentageOutput: '< 0.01%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
        usdmPreset: '$0.00',
        percentPrecet: '0.10%',
        percentLgPreset: '0%',
        percentVariablePreset: '0.1%',
        formattedPercentageUnit: '0.1%',
        token: '0.001',
        tokenFixed: '0.0010',
        tokenLg: '0',
        basisPointsPercent: '< 0.01%',
        bpPercent: '< 0.01%',
      },
      {
        input: '0.123456789',
        formattedPercentage: '12.35%',
        withoutArgs: '0.1',
        formattedDollarValue: '$0.12',
        bpPercentageOutput: '< 0.01%',
        usdPreset: '$0.12',
        usdForcedPreset: '$0.12',
        usdmPreset: '$0.12',
        percentPrecet: '12.35%',
        percentLgPreset: '12%',
        percentVariablePreset: '12.3457%',
        formattedPercentageUnit: '12.3%',
        token: '0.1235',
        tokenFixed: '0.1235',
        tokenLg: '0',
        basisPointsPercent: '< 0.01%',
        bpPercent: '< 0.01%',
      },
      {
        input: '0.6',
        formattedPercentage: '60.00%',
        withoutArgs: '0.6',
        formattedDollarValue: '$0.60',
        bpPercentageOutput: '< 0.01%',
        usdPreset: '$0.60',
        usdForcedPreset: '$0.60',
        usdmPreset: '$0.60',
        percentPrecet: '60.00%',
        percentLgPreset: '60%',
        percentVariablePreset: '60%',
        formattedPercentageUnit: '60.0%',
        token: '0.6',
        tokenFixed: '0.6000',
        tokenLg: '1',
        basisPointsPercent: '< 0.01%',
        bpPercent: '< 0.01%',
      },
      {
        input: '1.3',
        formattedPercentage: '130.00%',
        withoutArgs: '1.3',
        formattedDollarValue: '$1.30',
        bpPercentageOutput: '0.01%',
        usdPreset: '$1.30',
        usdForcedPreset: '$1.30',
        usdmPreset: '$1.30',
        percentPrecet: '130.00%',
        percentLgPreset: '130%',
        percentVariablePreset: '130%',
        formattedPercentageUnit: '130.0%',
        token: '1.3',
        tokenFixed: '1.3000',
        tokenLg: '1',
        basisPointsPercent: '0.01%',
        bpPercent: '0.01%',
      },
      {
        input: '8',
        formattedPercentage: '800.00%',
        withoutArgs: '8',
        formattedDollarValue: '$8.00',
        bpPercentageOutput: '0.08%',
        usdPreset: '$8.00',
        usdForcedPreset: '$8.00',
        usdmPreset: '$8.00',
        percentPrecet: '800.00%',
        percentLgPreset: '800%',
        percentVariablePreset: '800%',
        formattedPercentageUnit: '800.0%',
        token: '8',
        tokenFixed: '8.0000',
        tokenLg: '8',
        basisPointsPercent: '0.08%',
        bpPercent: '0.08%',
      },
      {
        input: '13.44',
        formattedPercentage: '1,344%',
        withoutArgs: '13.4',
        formattedDollarValue: '$13.44',
        bpPercentageOutput: '0.13%',
        usdPreset: '$13.44',
        usdForcedPreset: '$13.44',
        usdmPreset: '$13.44',
        percentPrecet: '1,344%',
        percentLgPreset: '1,344%',
        percentVariablePreset: '1,344%',
        formattedPercentageUnit: '1,344%',
        token: '13.44',
        tokenFixed: '13.4400',
        tokenLg: '13',
        basisPointsPercent: '0.13%',
        bpPercent: '0.13%',
      },
      {
        input: '121',
        formattedPercentage: '12,100%',
        withoutArgs: '121',
        formattedDollarValue: '$121.00',
        bpPercentageOutput: '1.21%',
        usdPreset: '$121.00',
        usdForcedPreset: '$121.00',
        usdmPreset: '$121.00',
        percentPrecet: '12,100%',
        percentLgPreset: '12,100%',
        percentVariablePreset: '12,100%',
        formattedPercentageUnit: '12,100%',
        token: '121',
        tokenFixed: '121.0000',
        tokenLg: '121',
        basisPointsPercent: '1.21%',
        bpPercent: '1.21%',
      },
      {
        input: '188.9123',
        formattedPercentage: '18,891%',
        withoutArgs: '188.9',
        formattedDollarValue: '$188.91',
        bpPercentageOutput: '1.89%',
        usdPreset: '$188.91',
        usdForcedPreset: '$188.91',
        usdmPreset: '$188.91',
        percentPrecet: '18,891%',
        percentLgPreset: '18,891%',
        percentVariablePreset: '18,891%',
        formattedPercentageUnit: '18,891%',
        token: '188.9123',
        tokenFixed: '188.9123',
        tokenLg: '189',
        basisPointsPercent: '1.89%',
        bpPercent: '1.89%',
      },
      {
        input: '5129.199911',
        formattedPercentage: '512,920%',
        withoutArgs: '5.1k',
        formattedDollarValue: '$5,129.20',
        bpPercentageOutput: '51.29%',
        usdPreset: '$5,129.20',
        usdForcedPreset: '$5,129.20',
        usdmPreset: '$5.13k',
        percentPrecet: '512,920%',
        percentLgPreset: '512,920%',
        percentVariablePreset: '512,920%',
        formattedPercentageUnit: '512,920%',
        token: '5,129.1999',
        tokenFixed: '5,129.1999',
        tokenLg: '5,129',
        basisPointsPercent: '51.29%',
        bpPercent: '51.29%',
      },
      {
        input: '87654',
        formattedPercentage: '8,765,400%',
        withoutArgs: '87.7k',
        formattedDollarValue: '$87,654.00',
        bpPercentageOutput: '876.54%',
        usdPreset: '$87,654',
        usdForcedPreset: '$87,654.00',
        usdmPreset: '$87.65k',
        percentPrecet: '8,765,400%',
        percentLgPreset: '8,765,400%',
        percentVariablePreset: '8,765,400%',
        formattedPercentageUnit: '8,765,400%',
        token: '87,654',
        tokenFixed: '87,654',
        tokenLg: '87,654',
        basisPointsPercent: '876.54%',
        bpPercent: '876.54%',
      },
      {
        input: '112124.3791743',
        formattedPercentage: '11,212,438%',
        withoutArgs: '112.1k',
        formattedDollarValue: '$112,124.38',
        bpPercentageOutput: '1,121%',
        usdPreset: '$112,124',
        usdForcedPreset: '$112,124.38',
        usdmPreset: '$112.12k',
        percentPrecet: '11,212,438%',
        percentLgPreset: '11,212,438%',
        percentVariablePreset: '11,212,438%',
        formattedPercentageUnit: '11,212,438%',
        token: '112,124',
        tokenFixed: '112,124',
        tokenLg: '112,124',
        basisPointsPercent: '1,121%',
        bpPercent: '1,121%',
      },
      {
        input: '1883234',
        formattedPercentage: '188,323,400%',
        withoutArgs: '1.9m',
        formattedDollarValue: '$1,883,234.00',
        bpPercentageOutput: '18,832%',
        usdPreset: '$1,883,234',
        usdForcedPreset: '$1,883,234.00',
        usdmPreset: '$1.88m',
        percentPrecet: '188,323,400%',
        percentLgPreset: '188,323,400%',
        percentVariablePreset: '188,323,400%',
        formattedPercentageUnit: '188,323,400%',
        token: '1,883,234',
        tokenFixed: '1,883,234',
        tokenLg: '1,883,234',
        basisPointsPercent: '18,832%',
        bpPercent: '18,832%',
      },
      {
        input: '121237821371',
        formattedPercentage: '12,123,782,137,100%',
        withoutArgs: '121.2b',
        formattedDollarValue: '$121,237,821,371.00',
        bpPercentageOutput: '1,212,378,214%',
        usdPreset: '$121,237,821,371',
        usdForcedPreset: '$121,237,821,371.00',
        usdmPreset: '$121.24b',
        percentPrecet: '12,123,782,137,100%',
        percentLgPreset: '12,123,782,137,100%',
        percentVariablePreset: '12,123,782,137,100%',
        formattedPercentageUnit: '12,123,782,137,100%',
        token: '121,237,821,371',
        tokenFixed: '121,237,821,371',
        tokenLg: '121,237,821,371',
        basisPointsPercent: '1,212,378,214%',
        bpPercent: '1,212,378,214%',
      },
    ];

    const badTestNumbers = ['NaN', '-', ''];

    it('Should return 0 for an empty string', () => {
      expect(fNum('')).toEqual('-');
    });

    it('should return bad inputs as -', () => {
      badTestNumbers.forEach(badTestNumber => {
        const formattedNumber = fNum(badTestNumber, {
          style: 'decimal',
          maximumFractionDigits: 20,
          useGrouping: false,
          fixedFormat: true,
        });
        expect(formattedNumber).toEqual('-');
      });
    });

    it('Should not lose any precision with numbers passed as a string', () => {
      testNumbers.forEach(testNumber => {
        if (Number(testNumber.input) === 0) return; // Ignore 0 numbers as it will always trim their precision.
        const formattedNumber = fNum(testNumber.input, {
          style: 'decimal',
          maximumFractionDigits: 20,
          useGrouping: false,
          fixedFormat: true,
        });
        expect(formattedNumber).toEqual(testNumber.input);
      });
    });

    it('Should not lose any precision with numbers passed as a number', () => {
      testNumbers.forEach(testNumber => {
        if (testNumber.input === '') return; // Ignore empty string as that is converted to 0
        if (Number(testNumber.input) === 0) return; // Ignore 0 numbers as it will always trim their precision.
        const testNumberAsNumber = Number(testNumber.input);
        const formattedNumber = fNum(testNumberAsNumber, {
          style: 'decimal',
          maximumFractionDigits: 20,
          useGrouping: false,
          fixedFormat: true,
        });
        expect(formattedNumber).toEqual(testNumber.input);
      });
    });

    it('Should give the same result without any arguments', () => {
      testNumbers.forEach(testNumber => {
        const format = fNum(testNumber.input, {
          style: 'decimal',
          maximumFractionDigits: 1,
          abbreviate: true,
        });
        expect(format).toEqual(testNumber.withoutArgs);
      });
    });

    it('Should give the same result as a formatted percentage', () => {
      testNumbers.forEach(testNumber => {
        if (Number(testNumber.input) > 0 && Number(testNumber.input) < 0.01)
          return;

        const format = fNum(testNumber.input, {
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          fixedFormat: true,
        });
        expect(format).toEqual(testNumber.formattedPercentage);
      });
    });

    it('Should give the same result as a formatted dollar value', () => {
      testNumbers.forEach(testNumber => {
        const format = fNum(testNumber.input, {
          style: 'currency',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          fixedFormat: true,
        });

        expect(format).toEqual(testNumber.formattedDollarValue);
      });
    });

    it('Should return the same result as usd preset', () => {
      testNumbers.forEach(testNumber => {
        const format = fNum(testNumber.input, FNumFormats.fiat);
        expect(format).toEqual(testNumber.usdPreset);
      });
    });

    it('Should return the same result as usd forced preset', () => {
      testNumbers.forEach(testNumber => {
        const format = fNum(testNumber.input, {
          style: 'currency',
          dontAdjustLarge: true,
        });
        expect(format).toEqual(testNumber.usdForcedPreset);
      });
    });

    it('Should return the same result as usd_m preset', () => {
      testNumbers.forEach(testNumber => {
        const format = fNum(testNumber.input, {
          style: 'currency',
          abbreviate: true,
        });
        expect(format).toEqual(testNumber.usdmPreset);
      });
    });

    it('Should return the same result as percent preset', () => {
      testNumbers.forEach(testNumber => {
        if (Number(testNumber.input) > 0 && Number(testNumber.input) < 0.01)
          return;

        const format = fNum(testNumber.input, {
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        expect(format).toEqual(testNumber.percentPrecet);
      });
    });

    it('Should return the same result as percent_lg preset', () => {
      testNumbers.forEach(testNumber => {
        if (Number(testNumber.input) > 0 && Number(testNumber.input) < 0.01)
          return;

        const format = fNum(testNumber.input, {
          style: 'percent',
          maximumFractionDigits: 0,
        });
        expect(format).toEqual(testNumber.percentLgPreset);
      });
    });

    it('Should return the same result as bp percent', () => {
      testNumbers.forEach(testNumber => {
        const format = fNum(testNumber.input, FNumFormats.bp);
        expect(format).toEqual(testNumber.bpPercent);
      });
    });

    it('Should return the same result as percent_variable preset', () => {
      testNumbers.forEach(testNumber => {
        if (Number(testNumber) > 0 && Number(testNumber) < 0.01) return;

        const format = fNum(testNumber.input, {
          style: 'percent',
          maximumFractionDigits: 4,
          dontAdjustLarge: true,
        });
        expect(format).toEqual(testNumber.percentVariablePreset);
      });
    });

    it('Should return the same result as a formatted percentage unit', () => {
      testNumbers.forEach(testNumber => {
        if (Number(testNumber) > 0 && Number(testNumber) < 0.01) return;

        const format = fNum(testNumber.input, {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
          fixedFormat: true,
        });
        expect(format).toEqual(testNumber.formattedPercentageUnit);
      });
    });

    it('Should return the same result for token', () => {
      testNumbers.forEach(testNumber => {
        const format = fNum(testNumber.input, FNumFormats.token);
        expect(format).toEqual(testNumber.token);
      });
    });

    it('Should return the same result for token_fixed', () => {
      testNumbers.forEach(testNumber => {
        const format = fNum(testNumber.input, {
          minimumFractionDigits: 4,
          maximumFractionDigits: 4,
        });
        expect(format).toEqual(testNumber.tokenFixed);
      });
    });

    it('Should return the same result for token_lg', () => {
      testNumbers.forEach(testNumber => {
        const format = fNum(testNumber.input, {
          style: 'decimal',
          maximumFractionDigits: 0,
        });
        expect(format).toEqual(testNumber.tokenLg);
      });
    });

    it('Should return the same result for basis points / 10000 as percent', () => {
      testNumbers.forEach(testNumber => {
        const format = fNum(
          new BigNumber(testNumber.input).div(10000).toString(),
          FNumFormats.percent
        );
        expect(format).toEqual(testNumber.basisPointsPercent);
      });
    });

    it('Should not return < 0.0001 if fixedFormat is true', () => {
      const testNumber = '0.00000123';
      const formattedNumber = fNum(testNumber, {
        maximumSignificantDigits: 6,
        fixedFormat: true,
      });
      expect(formattedNumber).toEqual(testNumber);
    });

    it('Should return < 0.01% if percent is between 0 and 0.01', () => {
      const formattedNumber = fNum('0.00009', FNumFormats.percent);
      expect(formattedNumber).toEqual('< 0.01%');
    });
  });

  describe('toFiat', () => {
    const { toFiat } = result;

    it('Should multiply amount by token price', async () => {
      const amount = 2.5;
      //priceFor function always returns 2 in the tokens.provider mock
      const priceFor = 2;
      const expectedValue = (amount * priceFor).toString();
      const value = toFiat(amount, 'any token address');
      expect(value).toEqual(expectedValue);
    });
  });

  describe('bspToDec', () => {
    it('Returns correct decimal value', () => {
      const val = bspToDec(500); // 5%
      expect(val).toEqual(0.05);
    });
  });
});
