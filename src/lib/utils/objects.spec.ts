import { convertKeysToLowerCase } from './objects';

it('convertKeysToLowerCase', () => {
  expect(convertKeysToLowerCase({ Address1: { ADDRESS2: true } })).toEqual({
    address1: { address2: true },
  });
});
