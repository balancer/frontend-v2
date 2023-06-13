import { isSameAddress } from '@/lib/utils';

export function isGaugeExpired(
  expiredGauges: readonly string[] | undefined,
  gaugeAddress: string
): boolean {
  if (!expiredGauges) return false;
  return !!expiredGauges.some(item => isSameAddress(gaugeAddress, item));
}
