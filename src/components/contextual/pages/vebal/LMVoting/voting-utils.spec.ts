import { randomAddress } from '@tests/unit/builders/address';
import { isGaugeExpired } from './voting-utils';

test('isGaugeExpired', () => {
  const gauge = randomAddress();
  const expiredGauge = randomAddress();
  const expiredGauges = [expiredGauge];

  expect(isGaugeExpired(expiredGauges, gauge)).toBeFalse();
  expect(isGaugeExpired(expiredGauges, expiredGauge)).toBeTrue();
});
