import { computed, ref, Ref, toRef } from 'vue';
import { getAddress } from '@ethersproject/address';
import { bnum } from '@/lib/utils';
import {
  AnyPool,
  FullPool,
  FullPoolWithFarm
} from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';

export function useBoostedPool(
  pool: Ref<FullPoolWithFarm>,
  poolCalculator: PoolCalculator,
  pools: Ref<FullPool[]>
) {
  const { tokens, balances, balanceFor } = useTokens();

  const userBoostedPoolBalance = computed(() => {
    const farm = pool.value.decoratedFarm;

    const userBalance = parseFloat(balanceFor(getAddress(pool.value.address)));
    const farmBalance = farm ? farm.userBpt : 0;

    const { receive } = poolCalculator.propAmountsGiven(
      `${userBalance + farmBalance}`,
      0,
      'send'
    );

    if (pool.value.mainTokens) {
      const tokenAddresses = pool.value.tokenAddresses;

      return pool.value.mainTokens.map(mainToken => {
        if (tokenAddresses.includes(mainToken)) {
          //this mainToken is a base asset on the pool, not nested
          const index = tokenAddresses.indexOf(mainToken);

          return receive[index];
        }

        //find the linear pool for this mainToken if there is one
        const linearPool = pool.value.linearPools?.find(
          linearPool => linearPool.mainToken.address === mainToken
        );

        if (linearPool) {
          const linearPoolAddress = getAddress(linearPool.address);

          if (tokenAddresses.includes(linearPoolAddress)) {
            //the linear pool BPT is nested in this pool
            const index = tokenAddresses.indexOf(linearPoolAddress);

            return bnum(receive[index])
              .times(linearPool.priceRate)
              .toString();
          } else {
            // this linear pool BPT is nested in a stable phantom BPT
            const stablePhantomPool = pools.value.find(
              pool =>
                pool.poolType === 'StablePhantom' &&
                tokenAddresses.includes(getAddress(pool.address))
            );

            if (stablePhantomPool) {
              const index = tokenAddresses.indexOf(
                getAddress(stablePhantomPool.address)
              );
              const bptBalance = receive[index];
              return bnum(bptBalance)
                .div(stablePhantomPool.totalShares)
                .times(linearPool.totalSupply)
                .times(linearPool.priceRate)
                .toString();
            }
          }
        }

        return '0';
      });
    }

    return receive;
  });

  return {
    userBoostedPoolBalance
  };
}
