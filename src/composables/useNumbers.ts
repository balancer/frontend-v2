import numeral from 'numeral';
import BigNumber from 'bignumber.js';
import useTokens from './useTokens';

export type Preset =
  | 'default'
  | 'token'
  | 'token_fixed'
  | 'token_lg'
  | 'usd'
  | 'usd_lg'
  | 'percent'
  | 'percent_lg';

interface Options {
  format?: string;
  forcePreset?: boolean;
}

enum PresetFormats {
  default = '(0.[0]a)',
  token = '0,0.[0000]',
  token_fixed = '0,0.0000',
  token_lg = '0,0',
  usd = '$0,0.00',
  usd_lg = '$0,0',
  usd_m = '$0,0.00a',
  percent = '0.00%',
  percent_lg = '0%'
}

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
  if (number < 1e-6) {
    // Numeral returns NaN in this case so just set to zero.
    // https://github.com/adamwdraper/Numeral-js/issues/596
    number = 0;
  }

  return numeral(number).format(
    PresetFormats[adjustedPreset || preset || 'default']
  );
}

export default function useNumbers() {
  const { priceFor } = useTokens();

  function toFiat(amount: number | string, tokenAddress: string): string {
    const price = priceFor(tokenAddress);
    const tokenAmount = new BigNumber(amount);
    return tokenAmount.times(price).toString();
  }

  return { fNum, toFiat };
}
