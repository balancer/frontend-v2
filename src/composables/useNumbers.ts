import numeral from 'numeral';
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
    number: number,
    preset: Preset | null = 'default',
    format = ''
  ) {
    if (format) return numeral(number).format(format);

    let adjustedPreset;
    if (number >= 10_000) {
      adjustedPreset = `${preset}_lg`;
    }

    return numeral(number).format(
      PresetFormats[adjustedPreset || preset || 'default']
    );
  }

  function toFiat(amount: number, tokenAddress: string) {
    const rate =
      store.state.market.prices[tokenAddress.toLowerCase()]?.price || 0;
    return amount * rate;
  }

  return { fNum, toFiat };
}
