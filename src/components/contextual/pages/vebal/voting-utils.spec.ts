import { randomAddress } from '@tests/unit/builders/address';
import {
  formatVoteSharesWith2Decimals,
  isGaugeExpired,
  sharesToBps,
  voteLockedUntilText,
} from './voting-utils';

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

test('formatVoteSharesWith2Decimals', () => {
  expect(formatVoteSharesWith2Decimals('')).toBe('0.00');
  expect(formatVoteSharesWith2Decimals('12')).toBe('12.00');
  expect(formatVoteSharesWith2Decimals('12.0')).toBe('12.00');
  expect(formatVoteSharesWith2Decimals('12.3')).toBe('12.30');
  expect(formatVoteSharesWith2Decimals('12.00')).toBe('12.00');
  expect(formatVoteSharesWith2Decimals('12.001')).toBe('12.001');
});

test('sharesToBPS', () => {
  expect(sharesToBps('3.1').toNumber()).toBe(310);
});
