import { defaultWeightedPoolId } from '@/__mocks__/weighted-pool';
// eslint-disable-next-line no-restricted-imports
import { Multicaller } from '@/services/multicalls/multicaller';
import {
  RawOnchainPoolData,
  RawOnchainPoolDataMap,
} from '@/services/pool/types';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { mockDeep } from 'vitest-mock-extended';
import { initMulticaller } from './Multicaller';

export const mockedOnchainTokenName = 'mocked onchain token name';

export const defaultLockedAmountBN = parseUnits('0.5');
export const defaultLockedAmount = formatUnits(defaultLockedAmountBN, 18);

class MulticallerMock extends Multicaller {
  //@ts-ignore
  execute() {
    // this.calls.forEach(call => {
    //   console.log(call);
    //   // TODO:create a system to mock these calls with good DX
    // });

    return {
      'test poolId': {
        'test poolId': BigNumber.from('2000000000000000000'),
      },
    };
  }
}

export function generateMulticallerMock() {
  return MulticallerMock;
}

export function initMulticallerWithDefaultMocks() {
  //@ts-ignore
  initMulticaller(generateMulticallerMock());
}

let poolId = defaultWeightedPoolId;

export function initMulticallPoolId(id: string) {
  poolId = id;
}

export function initMulticallerAsPoolMulticallerMock() {
  // Used for tests which code uses Multicaller from pool.multicaller, that is, to fetch onchain data to decorate a given SDL pool
  // pool.multicaller defines its output type RawOnchainPoolDataMap that we can use in this mock
  // We will replace this mock with MulticallerMock in future PRs
  class MulticallerMock {
    execute() {
      const result = mockDeep<RawOnchainPoolDataMap>();
      const chainDataMock = mockDeep<RawOnchainPoolData>();
      chainDataMock.amp = {
        //@ts-ignore
        value: BigNumber.from('40'),
        //@ts-ignore
        precision: BigNumber.from('1'),
      };
      chainDataMock.decimals = 18;
      //@ts-ignore
      chainDataMock.totalSupply = BigNumber.from(10000);
      //@ts-ignore
      chainDataMock.swapFee = BigNumber.from(0);
      chainDataMock.swapEnabled = true;
      chainDataMock.weights = [];
      result[poolId] = chainDataMock;
      return Promise.resolve(result);
    }
    call() {
      return this;
    }
  }

  //@ts-ignore
  initMulticaller(MulticallerMock);
}
