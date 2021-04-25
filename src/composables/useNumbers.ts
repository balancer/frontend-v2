import numeral from 'numeral';
import BigNumber from 'bignumber.js';
import { useStore } from 'vuex';

type Preset = 'default' | 'token' | 'token_lg' | 'usd' | 'usd_lg' | 'percent';

enum PresetFormats {
  default = '(0.[0]a)',
  token = '0,0.[0000]',
  token_lg = '0,0',
  usd = '$0,0.00',
  usd_lg = '$0,0',
  percent = '0.00%'
}

export default function useNumbers() {
  const store = useStore();
  function fNum(
    number: number | string,
    preset: Preset | null = 'default',
    format = ''
  ): string {
    if (format) return numeral(number).format(format);

    let adjustedPreset;
    if (number >= 10_000) {
      adjustedPreset = `${preset}_lg`;
    } else if (number < 1e-6) {
      // Numeral returns NaN in this case so just set to zero.
      // https://github.com/adamwdraper/Numeral-js/issues/596
      number = 0;
    }

    return numeral(number).format(
      PresetFormats[adjustedPreset || preset || 'default']
    );
  }

  function toFiat(amount: number | string, tokenAddress: string): number {
    const rate =
      store.state.market.prices[tokenAddress.toLowerCase()]?.price || 0;
    const tokenAmount = new BigNumber(amount);
    return tokenAmount.times(rate).toNumber();
  }

  return { fNum, toFiat };
}
