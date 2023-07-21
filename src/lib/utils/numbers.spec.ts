import { formatPercentage, isNumber } from './numbers';

it('detects valid numbers', () => {
  expect(isNumber('5')).toBeTrue();
  expect(isNumber('-4')).toBeTrue();
  expect(isNumber('123.456')).toBeTrue();
  expect(isNumber(54.23)).toBeTrue();
});

it('detects invalid numbers', () => {
  expect(isNumber('')).toBeFalse();
  expect(isNumber('-')).toBeFalse();
  expect(isNumber('a24')).toBeFalse();
});

it('formats percentage', () => {
  expect(formatPercentage('null')).toBe('-');
  expect(formatPercentage('0.000001')).toBe('0.0001%');
  expect(formatPercentage('0.07')).toBe('7.0000%');
});
