import { isJoinsDisabled } from './pool-restrictions';

test('detects disabled joins by id', async () => {
  expect(
    isJoinsDisabled(
      '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f'
    )
  ).toBeFalse();

  expect(isJoinsDisabled('testaddresswithdisabledjoins')).toBeTrue();
});
