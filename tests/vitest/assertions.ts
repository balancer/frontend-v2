import { Mock } from 'vitest';

export function firstCallParams(mock: Mock) {
  return mock.mock.calls[0][0];
}
