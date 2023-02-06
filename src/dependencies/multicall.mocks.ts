/* eslint-disable @typescript-eslint/no-unused-vars */

import { multicall } from '@/lib/utils/balancer/contract';
import { initMulticall } from './multicall';

type ProcessCallType = (calls: string[]) => any;

export function generateMulticallMock(
  processCall: ProcessCallType = defaultProcessCall
): typeof multicall {
  return function multicallMock<T>(
    network: string,
    provider,
    abi: any[],
    calls: any[],
    options: any = {},
    requireSuccess = false
  ): Promise<(T | null)[]> {
    return processCalls(calls, processCall);
  };
}

function processCalls<T>(
  calls: string[],
  processCallType
): Promise<T | null[]> {
  return Promise.all(
    calls.map(call => {
      return processCallType(call);
    })
  );
}

function defaultProcessCall(call) {
  const callType = call[1];
  if (callType === 'allowance') return 0;
  if (callType === 'balanceOf') return 25;
  console.warn(`callType ${callType} is not mocked`);
  return 0;
}

export function initMulticallWithDefaultMocks() {
  initMulticall(generateMulticallMock());
}
