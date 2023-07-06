export function allEqual<T>(array: T[]): boolean {
  return array.every(value => value === array[0]);
}
