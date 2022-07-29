import BigNumber from 'bignumber.js';
import numeral from 'numeral';

import useUserSettings from '@/composables/useUserSettings';
import { FiatCurrency } from '@/constants/currency';

import useTokens from './useTokens';

interface Options {
  format?: string;
  forcePreset?: boolean;
}

export interface FNumOptions extends Intl.NumberFormatOptions {
  fixedFormat?: boolean; // If true, don't auto-adjust based on number magnitde
  abbreviate?: boolean; // If true, reduce number size and add k/M/B to end
  dontAdjustLarge?: boolean; // If true, don't auto-adjust if the number is large
}

export const FNumFormats: Record<string, FNumOptions> = {
  percent: {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  token: {
    maximumFractionDigits: 4,
  },
  fiat: {
    style: 'currency',
  },
};

enum PresetFormats {
  default = '(0.[0]a)',
  default_lg = '(0.[0]a)',
  token = '0,0.[0000]',
  token_fixed = '0,0.0000',
  token_lg = '0,0',
  token_nodecimals = '0',
  usd = '$0,0.00',
  usd_lg = '$0,0',
  usd_m = '$0,0.00a',
  percent = '0.00%',
  percent_variable = '0.[0000]%',
  percent_lg = '0%',
}

export type Preset = keyof typeof PresetFormats;

export function fNum(
  number: number | string,
  preset: Preset | null = 'default',
  options: Options = {}
): string {
  if (options.format) return numeral(number).format(options.format);

  let adjustedPreset;
  if (
    number >= 10_000 &&
    !options.forcePreset &&
    !preset?.match(/_(lg|m|variable)$/)
  ) {
    adjustedPreset = `${preset}_lg`;
  }

  if (
    (preset === 'token' || preset === 'token_fixed') &&
    number > 0 &&
    number < 0.0001
  ) {
    return '< 0.0001';
  }

  if (number < 1e-6) {
    // Numeral returns NaN in this case so just set to zero.
    // https://github.com/adamwdraper/Numeral-js/issues/596
    number = 0;
  }

  return numeral(number).format(
    PresetFormats[adjustedPreset || preset || 'default']
  );
}

export function numF(
  number: number | string,
  options: FNumOptions | undefined = {},
  currency: FiatCurrency = FiatCurrency.usd
): string {
  if (typeof number === 'string') {
    if (number === 'NaN') number = 0;
    number = Number(number || 0);
  }

  const formatterOptions: Intl.NumberFormatOptions = { ...options };
  let postfixSymbol = '';

  if (options.abbreviate) {
    const lookup = [
      { value: 1, symbol: '' },
      { value: 1e3, symbol: 'k' },
      { value: 1e6, symbol: 'm' },
      { value: 1e9, symbol: 'b' },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
      .slice()
      .reverse()
      .find(function (item) {
        return number >= item.value;
      });
    postfixSymbol = item ? item.symbol : '';
    const fractionDigits = 2;
    number = item
      ? new BigNumber(
          (number / item.value).toFixed(fractionDigits).replace(rx, '$1')
        ).toNumber()
      : number;
  }

  if (number >= 1e4 && !options.fixedFormat && !options.dontAdjustLarge) {
    formatterOptions.minimumFractionDigits = 0;
    formatterOptions.maximumFractionDigits = 0;
  }

  if (options.style === 'percent') {
    if (
      number < 0 &&
      formatterOptions.maximumFractionDigits &&
      formatterOptions.maximumFractionDigits >= 2 &&
      (formatterOptions.minimumFractionDigits || 0) <
        formatterOptions.maximumFractionDigits - 2
    ) {
      // For consistency with numeral which rounds based on digits before percentages are multiplied by 100
      formatterOptions.maximumFractionDigits =
        formatterOptions.maximumFractionDigits - 2;
    }
    formatterOptions.useGrouping = false;

    if (number > 0 && number < 0.0001) {
      return '< 0.01%';
    }
  }

  if (options.style === 'currency') {
    formatterOptions.currency = currency;
  }

  if (!options.fixedFormat && !options.style && number > 0 && number < 0.0001) {
    return '< 0.0001';
  }

  if (!options.fixedFormat && number < 1e-6) {
    number = 0;
  }

  const formatter = new Intl.NumberFormat('en-US', formatterOptions);
  let formattedNumber = formatter.format(number);

  // If the number is -0, remove the negative
  if (formattedNumber[0] === '-' && !formattedNumber.match(/[1-9]/)) {
    formattedNumber = formattedNumber.slice(1);
  }

  return formattedNumber + postfixSymbol;
}

export default function useNumbers() {
  const { currency } = useUserSettings();
  const { priceFor } = useTokens();

  function toFiat(amount: number | string, tokenAddress: string): string {
    const price = priceFor(tokenAddress);
    const tokenAmount = new BigNumber(amount);
    return tokenAmount.times(price).toString();
  }

  function fNum2(
    number: number | string,
    options: FNumOptions | undefined = {}
  ): string {
    const _currency = currency?.value || FiatCurrency.usd;
    return numF(number, options, _currency);
  }

  return { fNum, fNum2, toFiat };
}
