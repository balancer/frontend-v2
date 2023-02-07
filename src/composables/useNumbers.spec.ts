import { mountComposable } from '@tests/mount-helpers';
import useNumbers, { bspToDec, FNumFormats } from './useNumbers';

vi.mock('@/providers/tokens.provider');

describe('useNumbers', () => {
  const { result } = mountComposable(() => useNumbers());

  it('Should load', () => {
    expect(result).toBeTruthy();
  });

  describe('fNum2', () => {
    const { fNum2 } = result;

    const testNumbers = [
      {
        input: '-5678',
        formattedPercentage: '-567800.00%',
        withoutArgs: '0',
        formattedDollarValue: '-$5,678.00',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
      },
      {
        input: '-122.45',
        formattedPercentage: '-12245.00%',
        withoutArgs: '0',
        formattedDollarValue: '-$122.45',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
      },
      {
        input: '-1',
        formattedPercentage: '-100.00%',
        withoutArgs: '0',
        formattedDollarValue: '-$1.00',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
      },
      {
        input: '-0.0078',
        formattedPercentage: '-0.78%',
        withoutArgs: '0',
        formattedDollarValue: '-$0.01',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
      },
      {
        input: '-0.1',
        formattedPercentage: '-10.00%',
        withoutArgs: '0',
        formattedDollarValue: '-$0.10',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
      },
      {
        input: '-0.0000443',
        formattedPercentage: '0.00%',
        withoutArgs: '0',
        formattedDollarValue: '$0.00',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
      },
      {
        input: '0',
        formattedPercentage: '0.00%',
        withoutArgs: '0',
        formattedDollarValue: '$0.00',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
      },
      {
        input: '0',
        formattedPercentage: '0.00%',
        withoutArgs: '0',
        formattedDollarValue: '$0.00',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
      },
      {
        input: '0',
        formattedPercentage: '0.00%',
        withoutArgs: '0',
        formattedDollarValue: '$0.00',
        bpPercentageOutput: '0.00%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
      },
      {
        input: '0.000005',
        formattedPercentage: '< 0.01%',
        withoutArgs: '0',
        formattedDollarValue: '$0.00',
        bpPercentageOutput: '< 0.01%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
      },
      {
        input: '0.001',
        formattedPercentage: '0.10%',
        withoutArgs: '0',
        formattedDollarValue: '$0.00',
        bpPercentageOutput: '< 0.01%',
        usdPreset: '$0.00',
        usdForcedPreset: '$0.00',
      },
      {
        input: '0.123456789',
        formattedPercentage: '12.35%',
        withoutArgs: '0.1',
        formattedDollarValue: '$0.12',
        bpPercentageOutput: '< 0.01%',
        usdPreset: '$0.12',
        usdForcedPreset: '$0.12',
      },
      {
        input: '0.6',
        formattedPercentage: '60.00%',
        withoutArgs: '0.6',
        formattedDollarValue: '$0.60',
        bpPercentageOutput: '< 0.01%',
        usdPreset: '$0.60',
        usdForcedPreset: '$0.60',
      },
      {
        input: '1.3',
        formattedPercentage: '130.00%',
        withoutArgs: '1.3',
        formattedDollarValue: '$1.30',
        bpPercentageOutput: '0.01%',
        usdPreset: '$1.30',
        usdForcedPreset: '$1.30',
      },
      {
        input: '8',
        formattedPercentage: '800.00%',
        withoutArgs: '8',
        formattedDollarValue: '$8.00',
        bpPercentageOutput: '0.08%',
        usdPreset: '$8.00',
        usdForcedPreset: '$8.00',
      },
      {
        input: '13.44',
        formattedPercentage: '1,344%',
        withoutArgs: '13.4',
        formattedDollarValue: '$13.44',
        bpPercentageOutput: '0.13%',
        usdPreset: '$13.44',
        usdForcedPreset: '$13.44',
      },
      {
        input: '121',
        formattedPercentage: '12,100%',
        withoutArgs: '121',
        formattedDollarValue: '$121.00',
        bpPercentageOutput: '1.21%',
        usdPreset: '$121.00',
        usdForcedPreset: '$121.00',
      },
      {
        input: '188.9123',
        formattedPercentage: '18,891%',
        withoutArgs: '188.9',
        formattedDollarValue: '$188.91',
        bpPercentageOutput: '1.89%',
        usdPreset: '$188.91',
        usdForcedPreset: '$188.91',
      },
      {
        input: '5129.199911',
        formattedPercentage: '512,920%',
        withoutArgs: '5.1k',
        formattedDollarValue: '$5,129.20',
        bpPercentageOutput: '51.29%',
        usdPreset: '$5,129.20',
        usdForcedPreset: '$5,129.20',
      },
      {
        input: '87654',
        formattedPercentage: '8,765,400%',
        withoutArgs: '87.7k',
        formattedDollarValue: '$87,654.00',
        bpPercentageOutput: '876.54%',
        usdPreset: '$87,654',
        usdForcedPreset: '$87,654.00',
      },
      {
        input: '112124.3791743',
        formattedPercentage: '11,212,438%',
        withoutArgs: '112.1k',
        formattedDollarValue: '$112,124.38',
        bpPercentageOutput: '1,121%',
        usdPreset: '$112,124',
        usdForcedPreset: '$112,124.38',
      },
      {
        input: '1883234',
        formattedPercentage: '188,323,400%',
        withoutArgs: '1.9m',
        formattedDollarValue: '$1,883,234.00',
        bpPercentageOutput: '18,832%',
        usdPreset: '$1,883,234',
        usdForcedPreset: '$1,883,234.00',
      },
      {
        input: '121237821371',
        formattedPercentage: '12,123,782,137,100%',
        withoutArgs: '121.2b',
        formattedDollarValue: '$121,237,821,371.00',
        bpPercentageOutput: '1,212,378,214%',
        usdPreset: '$121,237,821,371',
        usdForcedPreset: '$121,237,821,371.00',
      },
    ];

    const badTestNumbers = ['NaN', '-', ''];

    it('Should return 0 for an empty string', () => {
      expect(fNum2('')).toEqual('-');
    });

    it('should return bad inputs as -', () => {
      badTestNumbers.forEach(badTestNumber => {
        const formattedNumber = fNum2(badTestNumber, {
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
        const formattedNumber = fNum2(testNumber.input, {
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
        const formattedNumber = fNum2(testNumberAsNumber, {
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
        const format = fNum2(testNumber.input, {
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

        const format = fNum2(testNumber.input, {
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
        const format = fNum2(testNumber.input, {
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
        const format = fNum2(testNumber.input, FNumFormats.fiat);
        expect(format).toEqual(testNumber.usdPreset);
      });
    });

    it('Should return the same result as usd forced preset', () => {
      testNumbers.forEach(testNumber => {
        const format = fNum2(testNumber.input, {
          style: 'currency',
          dontAdjustLarge: true,
        });
        expect(format).toEqual(testNumber.usdForcedPreset);
      });
    });

    // it('Should return the same result as usd_m preset', () => {
    //   testNumbers.forEach(testNumber => {
    //     const format1 = fNum(testNumber.input, 'usd_m');
    //     const format2 = fNum2(testNumber.input, {
    //       style: 'currency',
    //       abbreviate: true,
    //     });
    //     expect(format2).toEqual(format1);
    //   });
    // });

    // it('Should return the same result as nested usd usd_m preset', () => {
    //   testNumbers.forEach(testNumber => {
    //     const format1 = fNum(fNum(testNumber.input, 'usd'), 'usd_m');
    //     const format2 = fNum2(testNumber.input, {
    //       style: 'currency',
    //       abbreviate: true,
    //     });
    //     expect(format2).toEqual(format1);
    //   });
    // });

    // it('Should return the same result as percent preset', () => {
    //   testNumbers.forEach(testNumber => {
    //     if (Number(testNumber.input) > 0 && Number(testNumber.input) < 0.01)
    //       return;

    //     const format = fNum2(testNumber.input, {
    //       style: 'percent',
    //       minimumFractionDigits: 2,
    //       maximumFractionDigits: 2,
    //     });
    //     expect(format).toEqual(testNumber.bpPercentageOutput);
    //   });
    // });

    // it('Should return the same result as percent_lg preset', () => {
    //   testNumbers.forEach(testNumber => {
    //     if (Number(testNumber.input) > 0 && Number(testNumber.input) < 0.01)
    //       return;

    //     const format1 = fNum(testNumber.input, 'percent_lg');
    //     const format2 = fNum2(testNumber.input, {
    //       style: 'percent',
    //       maximumFractionDigits: 0,
    //     });
    //     expect(format2).toEqual(format1);
    //   });
    // });

    // it('Should return the same result as percent_variable preset', () => {
    //   testNumbers.forEach(testNumber => {
    //     if (Number(testNumber) > 0 && Number(testNumber) < 0.01) return;

    //     const format1 = fNum(testNumber, 'percent_variable');
    //     const format2 = fNum2(testNumber, {
    //       style: 'percent',
    //       maximumFractionDigits: 4,
    //       dontAdjustLarge: true,
    //     });
    //     expect(format2).toEqual(format1);
    //   });
    // });

    // it('Should return the same result as a formatted percentage unit', () => {
    //   testNumbers.forEach(testNumber => {
    //     if (Number(testNumber) > 0 && Number(testNumber) < 0.01) return;

    //     const format1 = fNum(testNumber, null, { format: '0.0%' });
    //     const format2 = fNum2(testNumber, {
    //       style: 'percent',
    //       minimumFractionDigits: 1,
    //       maximumFractionDigits: 1,
    //       fixedFormat: true,
    //     });
    //     expect(format2).toEqual(format1);
    //   });
    // });

    // it('Should return the same result for token', () => {
    //   testNumbers.forEach(testNumber => {
    //     const format1 = fNum(testNumber, 'token');
    //     const format2 = fNum2(testNumber, FNumFormats.token);
    //     expect(format2).toEqual(format1);
    //   });
    // });

    // it('Should return the same result for token_fixed', () => {
    //   testNumbers.forEach(testNumber => {
    //     const format1 = fNum(testNumber, 'token_fixed');
    //     const format2 = fNum2(testNumber, {
    //       minimumFractionDigits: 4,
    //       maximumFractionDigits: 4,
    //     });
    //     expect(format2).toEqual(format1);
    //   });
    // });

    // it('Should return the same result for token_lg', () => {
    //   testNumbers.forEach(testNumber => {
    //     const format1 = fNum(testNumber, 'token_lg');
    //     const format2 = fNum2(testNumber, {
    //       style: 'decimal',
    //       maximumFractionDigits: 0,
    //     });
    //     expect(format2).toEqual(format1);
    //   });
    // });

    // it('Should return the same result for basis points / 10000 as percent', () => {
    //   testNumbers.forEach(testNumber => {
    //     const format1 = fNum2(testNumber, FNumFormats.bp);
    //     const format2 = fNum2(
    //       new BigNumber(testNumber).div(10000).toString(),
    //       FNumFormats.percent
    //     );
    //     expect(format2).toEqual(format1);
    //   });
    // });

    it('Should not return < 0.0001 if fixedFormat is true', () => {
      const testNumber = '0.00000123';
      const formattedNumber = fNum2(testNumber, {
        maximumSignificantDigits: 6,
        fixedFormat: true,
      });
      expect(formattedNumber).toEqual(testNumber);
    });

    it('Should return < 0.01% if percent is between 0 and 0.01', () => {
      const formattedNumber = fNum2('0.00009', FNumFormats.percent);
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
