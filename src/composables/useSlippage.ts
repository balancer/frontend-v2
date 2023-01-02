import { formatUnits, parseUnits } from '@ethersproject/units';
import BigNumber from 'bignumber.js';

import { bnum } from '@/lib/utils';

import { useUserSettings } from '@/providers/user-settings.provider';

export function getMinusSlippage(
  _amount: string,
  decimals: number,
  slippageBasisPoints: string | number
): string {
  let amount = parseUnits(_amount, decimals).toString();
  amount = getMinusSlippageScaled(amount, slippageBasisPoints);

  return formatUnits(amount, decimals);
}

export function getMinusSlippageScaled(
  amount: string,
  slippageBasisPoints: string | number
): string {
  const delta = bnum(amount)
    .times(slippageBasisPoints)
    .div(10000)
    .dp(0, BigNumber.ROUND_UP);

  return bnum(amount).minus(delta).toString();
}

export default function useSlippage() {
  const { slippageBsp } = useUserSettings();

  function minusSlippage(_amount: string, decimals: number): string {
    return getMinusSlippage(_amount, decimals, slippageBsp.value);
  }

  function minusSlippageScaled(amount: string): string {
    return getMinusSlippageScaled(amount, slippageBsp.value);
  }

  function addSlippage(_amount: string, decimals: number): string {
    let amount = parseUnits(_amount, decimals).toString();
    amount = addSlippageScaled(amount);

    return formatUnits(amount, decimals).toString();
  }

  function addSlippageScaled(amount: string): string {
    const delta = bnum(amount)
      .times(slippageBsp.value)
      .div(10000)
      .dp(0, BigNumber.ROUND_DOWN);

    return bnum(amount).plus(delta).toString();
  }

  return { minusSlippage, minusSlippageScaled, addSlippage, addSlippageScaled };
}
