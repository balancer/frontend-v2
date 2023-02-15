import { mock } from 'vitest-mock-extended';
import { UserDataResponse } from '../user-data.provider';

export function useTokens() {
  return userDataProvider();
}

export const mockUserDataProvider = mock<UserDataResponse>();

export function userDataProvider(): UserDataResponse {
  return mockUserDataProvider;
}
