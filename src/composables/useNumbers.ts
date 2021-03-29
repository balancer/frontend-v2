import numeral from 'numeral';

export default function useNumbers() {
  function format(number: number, _format = '(0.[0]a)') {
    return numeral(number).format(_format);
  }

  return { format };
}
