import { resolveRoute } from './route-resolver';

test('Resolves route by name', async () => {
  expect(resolveRoute({ name: 'swap' })).toBeFunction();
});

test('Resolves route by name', async () => {
  expect(() => resolveRoute({})).toThrowErrorMatchingInlineSnapshot(
    '"Provided route ([object Object]) must have name"'
  );
});
