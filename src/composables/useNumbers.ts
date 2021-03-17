import numeral from 'numeral';

export default function useNumbers() {
  function format(number: number, _format: string) {
    if (!_format) {
      _format = '(0.[0]a)';
      if (number < 1) _format = '0.[000]';
      if (number == 0) return '-';
    }
    return numeral(number).format(_format);
  }

  return { format };
}
