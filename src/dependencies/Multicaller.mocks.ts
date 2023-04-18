// eslint-disable-next-line no-restricted-imports
import { Multicaller } from '@/services/multicalls/multicaller';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
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
