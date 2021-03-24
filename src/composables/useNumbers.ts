import numeral from 'numeral';

export default function useNumbers() {
  function format(number: number, _format = '(0.[0]a)') {
    if (number < 1) _format = '0.[000]';
    return numeral(number).format(_format);
  }

  return { format };
}
