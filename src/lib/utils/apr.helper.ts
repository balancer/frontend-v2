import axios from 'axios';
import { formatUnits } from 'ethers/lib/utils';

import { FiatCurrency } from '@/constants/currency';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { LinearPoolData, Pool } from '@/services/pool/types';

import { bnum } from '.';

export async function calcUSDPlusWeightedAPR(
  pool: Pool,
  linearPool: LinearPoolData,
  linearPoolAddress: string,
  prices: TokenPrices,
  currency: FiatCurrency
): Promise<string> {
  const { data: apr } = await axios.get(
    'https://app.overnight.fi/api/balancer/week/apr'
  );

  const mainToken = linearPool.mainToken.address;
  const price = prices[mainToken][currency] || 0;
  const wrappedTokenBalance = formatUnits(linearPool.wrappedToken.balance, 6);

  const linearPoolBalance =
    pool.onchain?.tokens[linearPoolAddress].balance || '0';
  const linearPoolShare = bnum(linearPoolBalance)
    .div(linearPool.totalSupply)
    .toString();

  const actualBalance = bnum(wrappedTokenBalance).times(linearPoolShare);

  const value = actualBalance.times(price);

  return value.times(apr).div(pool.totalLiquidity).toString();
}
