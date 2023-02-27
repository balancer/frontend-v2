import BigNumber from 'bignumber.js';

import { useUserSettings } from '@/providers/user-settings.provider';
import { FiatCurrency } from '@/constants/currency';
import { bnum } from '@/lib/utils';
import { useTokens } from '@/providers/tokens.provider';

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
  // Basis Points
  bp: {
    style: 'bp',
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

export function numF(
  number: number | string,
  options: FNumOptions | undefined = {},
  currency: FiatCurrency = FiatCurrency.usd
): string {
  if (typeof number === 'string') {
    if (number === 'NaN') return '-';
    if (number === '') return '-';
    if (number === '-') return '-';
    number = Number(number || 0);
  }

  // bp - basis points
  if (options.style === 'bp') {
    number = bnum(number).div(10000).toNumber();
    options = { ...options, style: 'percent' };
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

  if (options.style === 'percent') {
    formattedNumber = formatBigPercent(formattedNumber);
  }

  return formattedNumber + postfixSymbol;
}

/**
 * Convert number in basis points scale to percentage decimal.
 * e.g. 500 bps = 0.05 (5%)
 *
 * @param {number | string} bspValue - Value in basis points.
 * @returns percent value in decimals.
 */
export function bspToDec(bspValue: number | string): number {
  return bnum(bspValue).div(10_000).toNumber();
}

/**
 * @summary Returns processed percent, which is > 1000.
 * @example formatBigPercent('1337.23%');  // => '1,337%'
 */
export function formatBigPercent(percent: string): string {
  const _percent = Number(percent.replace('%', ''));

  if (_percent >= 1000) {
    return `${_percent.toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}%`;
  }
  return percent;
}

export default function useNumbers() {
  const { currency } = useUserSettings();
  const { priceFor } = useTokens();

  function toFiat(amount: number | string, tokenAddress: string): string {
    const price = priceFor(tokenAddress);
    return bnum(amount).times(price).toString();
  }

  /**
   * Converts a fiat value into a fiat label.
   *
   * @param {number | string} value - The number to format.
   * @returns {string} - The formatted number.
   */
  function toFiatLabel(value: number | string): string {
    return fNum(value, FNumFormats.fiat);
  }

  /**
   * Converts a token value into a token label.
   *
   * @param {number | string} value - The number to format.
   * @returns {string} - The formatted number.
   */
  function toTokenLabel(value: number | string): string {
    return fNum(value, FNumFormats.token);
  }

  function fNum(
    number: number | string,
    options: FNumOptions | undefined = {}
  ): string {
    const _currency = currency?.value || FiatCurrency.usd;
    return numF(number, options, _currency);
  }

  return { fNum, toFiat, toFiatLabel, toTokenLabel };
}
