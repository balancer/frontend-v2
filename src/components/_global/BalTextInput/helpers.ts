/**
 * Slices the decimals that exceed the given decimal limit
 */
export function overflowProtected(
  value: string | number,
  decimalLimit: number
): string {
  const stringValue = value.toString();
  const [numberStr, decimalStr] = stringValue.split('.');

  if (decimalStr && decimalStr.length > decimalLimit) {
    const maxLength = numberStr.length + decimalLimit + 1;
    return stringValue.slice(0, maxLength);
  } else return stringValue;
}
