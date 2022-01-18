import numeral from 'numeral';
import BigNumber from 'bignumber.js';
import useTokens from './useTokens';

interface Options {
  format?: string;
  forcePreset?: boolean;
  noDecimals?: boolean;
}

export interface FNumOptions extends Intl.NumberFormatOptions {
  noDecimals?: boolean;
}


enum PresetFormats {
  default = '(0.[0]a)',
  token = '0,0.[0000]',
  token_fixed = '0,0.0000',
  token_lg = '0,0',
  token_nodecimals = '0',
  usd = '$0,0.00',
  usd_lg = '$0,0',
  usd_m = '$0,0.00a',
  usd_nodecimals = '$0,0',
  percent = '0.00%',
  percent_variable = '0.[0000]%',
  percent_lg = '0%'
}

export type Preset = keyof typeof PresetFormats;

export function fNum(
  number: number | string,
  preset: Preset | null = 'default',
  options: Options = {}
): string {
  if (options.format) return numeral(number).format(options.format);

  let adjustedPreset;
  if (number >= 10_000 && !options.forcePreset) {
    adjustedPreset = `${preset}_lg`;
  }

  if (options.noDecimals) {
    adjustedPreset = `${preset}_nodecimals`;
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

export function fNum2(
  number: number | string,
  options: FNumOptions | undefined = {}
): string {
  if (typeof number === 'string') {
    number = new BigNumber(number).toNumber();
  }

  const formatterOptions: Intl.NumberFormatOptions = Object.assign({}, options);
  if (options.noDecimals) {
    formatterOptions.maximumFractionDigits = 0;
  }

  if (
    number >= 1e4 &&
    !formatterOptions.minimumFractionDigits &&
    !formatterOptions.maximumFractionDigits
  ) {
    formatterOptions.minimumFractionDigits = 0;
    formatterOptions.maximumFractionDigits = 0;
  }

  // For consistency with numeral
  if (options.unit === 'percent') {
    number = number * 100;
    formatterOptions.useGrouping = false;
  }

  if (formatterOptions.style === 'currency') {
    formatterOptions.currency = 'USD';
  }

  const formatter = new Intl.NumberFormat('en-US', formatterOptions);

  return formatter.format(number);
}

export default function useNumbers() {
  const { priceFor } = useTokens();

  function toFiat(amount: number | string, tokenAddress: string): string {
    const price = priceFor(tokenAddress);
    const tokenAmount = new BigNumber(amount);
    return tokenAmount.times(price).toString();
  }

  return { fNum, fNum2, toFiat };
}
