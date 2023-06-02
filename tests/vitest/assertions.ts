import { Mock } from 'vitest';

/**
 * Returns the parameters used in the first call to the provided mock
 */
export function firstCallParams<TArgs extends any[] = any>(
  mock: Mock<TArgs>
): TArgs[0] {
  return mock.mock.calls[0][0];
}
