import { bnum } from '@/lib/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

import { Pool } from '../../types';

export type ExcludedAddresses = Record<
  string,
  Record<string, BigNumber>
> | null;

export function removeAddressesFromTotalLiquidity(
  excludedAddresses: ExcludedAddresses,
  pool: Pool,
  totalLiquidityString: string
) {
  const totalLiquidity = bnum(totalLiquidityString);
  let miningTotalLiquidity = totalLiquidity;

  if (excludedAddresses != null && excludedAddresses[pool.address] != null) {
    Object.values(excludedAddresses[pool.address]).forEach(accountBalance => {
      const accountBalanceFormatted = formatUnits(accountBalance, 18);
      const poolShare = bnum(accountBalanceFormatted).div(pool.totalShares);

      miningTotalLiquidity = miningTotalLiquidity.minus(
        totalLiquidity.times(poolShare)
      );
    });
  }

  return miningTotalLiquidity.toString();
}
