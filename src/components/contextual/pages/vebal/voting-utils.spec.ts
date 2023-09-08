import { randomAddress } from '@tests/unit/builders/address';
import { isGaugeExpired, voteLockedUntilText } from './voting-utils';

test('isGaugeExpired', () => {
  const gauge = randomAddress();
  const expiredGauge = randomAddress();
  const expiredGauges = [expiredGauge];

  expect(isGaugeExpired(expiredGauges, gauge)).toBeFalse();
  expect(isGaugeExpired(expiredGauges, expiredGauge)).toBeTrue();
});

test('calculates finish date of current veBal lock (voteLockedUntilText)', () => {
  // Date.now is Jan 1st 2023 by default in all tests
  expect(voteLockedUntilText()).toBe('11 January 2023');
});
