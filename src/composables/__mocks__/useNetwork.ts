import { mockDeep } from 'vitest-mock-extended';
import useNetwork from '@/composables/useNetwork';

type UseJoinExitReturnType = ReturnType<typeof useNetwork>;

const useNetworkReturnMock = mockDeep<UseJoinExitReturnType>();

export default () => useNetworkReturnMock;
