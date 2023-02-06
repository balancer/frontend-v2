import { mockDeep } from 'vitest-mock-extended';
import useJoinExit from '../useJoinExit';

type UseJoinExitReturnType = ReturnType<typeof useJoinExit>;

const useJoinExitReturnMock = mockDeep<UseJoinExitReturnType>();

export default () => useJoinExitReturnMock;
