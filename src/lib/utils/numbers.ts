export function isNumber(str: string | number): boolean {
  if (str === '') {
    return false;
  }

  return !Number.isNaN(Number(str));
}
