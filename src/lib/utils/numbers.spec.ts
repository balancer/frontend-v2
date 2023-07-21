import { isNumber } from './numbers';

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
