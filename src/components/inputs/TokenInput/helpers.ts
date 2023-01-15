export function getAriaLabelledbyAttr(
  address: string | null | undefined
): string | undefined {
  return address ? `token-input-symbol-${address}` : undefined;
}
