import { generateSalt } from './random';

test('Generates a random 32 bytes salt', () => {
  expect(generateSalt()).toBeString();
  expect(generateSalt()).toHaveLength(66);
  expect(generateSalt()).toStartWith('0x');
});
