import { computed, Ref } from 'vue';
import { getAddress } from '@ethersproject/address';
import { FullPoolWithFarm } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { keyBy } from 'lodash';

export function useBoostedPool(
  pool: Ref<FullPoolWithFarm>,
  poolCalculator: PoolCalculator
) {
  const { balanceFor } = useTokens();

  const userPoolBalance = computed(() => {
    const farm = pool.value.decoratedFarm;

    const userBalance = parseFloat(balanceFor(getAddress(pool.value.address)));
    const farmBalance = farm ? farm.userBpt : 0;

    const { receive } = poolCalculator.propAmountsGiven(
      `${userBalance + farmBalance}`,
      0,
      'send'
    );

    return receive;
  });

  const boostedPoolUserMainTokenBalances = computed(() => {
    const farm = pool.value.decoratedFarm;

    const userBalance = parseFloat(balanceFor(getAddress(pool.value.address)));
    const farmBalance = farm ? farm.userBpt : 0;

    const { receive } = poolCalculator.propAmountsGiven(
      `${userBalance + farmBalance}`,
      0,
      'send'
    );

    return (pool.value.mainTokens || []).map(mainTokenAddress => {
      const tokenIndex = pool.value.tokensList.findIndex(
        token => token.toLowerCase() === mainTokenAddress.toLowerCase()
      );

      if (tokenIndex !== -1) {
        return {
          address: getAddress(mainTokenAddress),
          balance: receive[tokenIndex]
        };
      }

      const linearPool = (pool.value.linearPools || []).find(
        pool =>
          pool.mainToken.address.toLowerCase() ===
          mainTokenAddress.toLowerCase()
      );

      if (linearPool) {
        const userShare =
          (userBalance + farmBalance) / parseFloat(pool.value.totalShares);

        return {
          address: getAddress(mainTokenAddress),
          balance: `${parseFloat(linearPool.mainTokenTotalBalance) * userShare}`
        };
      }

      return { address: getAddress(mainTokenAddress), balance: '0' };
    });
  });

  return {
    userPoolBalance,
    boostedPoolUserMainTokenBalances
  };
}
