import { getAddress } from '@ethersproject/address';
import differenceInDays from 'date-fns/differenceInDays';
import { computed, ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';

// import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { FullPool, PoolActivity } from '@/services/balancer/subgraph/types';

import useNumbers from '../useNumbers';

const TRANSACTION_NUM_STYLE = {
  style: 'currency',
  abbreviate: true
};

export default function usePoolTransactionStats(
  pool: ComputedRef<FullPool>,
  poolActivities?: ComputedRef<PoolActivity[]>,
  poolSwaps?: ComputedRef<PoolActivity[]>
) {
  const { tokens, priceFor } = useTokens();
  const { fNum2 } = useNumbers();
  const { t } = useI18n();

  function getPoolInvestmentValue(amounts: PoolActivity['amounts']) {
    let total = bnum(0);

    for (let i = 0; i < amounts.length; i++) {
      const amount = amounts[i];
      const address = getAddress(pool.value.tokensList[i]);
      const token = tokens.value[address];
      const price = priceFor(token.address);
      const amountNumber = Math.abs(parseFloat(amount));

      // If the price is unknown for any of the positive amounts - the value cannot be computed.
      if (amountNumber > 0 && price === 0) {
        return 0;
      }

      total = total.plus(bnum(amountNumber).times(price));
    }

    return total.toNumber();
  }

  const investTransactionStats = computed(() => {
    if (!pool.value || !poolActivities?.value) {
      return [];
    }

    const poolInvestmentsLength = poolActivities.value.length;

    if (poolInvestmentsLength === 0) {
      return [];
    }

    let lastTransactions: PoolActivity[] = [];
    let period = '(24h)';
    const lastDayInvests = poolActivities.value.filter(
      invest => differenceInDays(new Date(), new Date(invest.timestamp)) <= 1
    );

    if (lastDayInvests.length >= 3) {
      lastTransactions = lastDayInvests;
    } else {
      period = '(7d)';
      lastTransactions = poolActivities.value.filter(
        invets => differenceInDays(new Date(), new Date(invets.timestamp)) <= 7
      );
    }

    if (lastTransactions.length === 0) {
      return [];
    }
    const lastInvestments = lastTransactions.filter(
      transaction => transaction.type === 'Join'
    );

    console.log('lastDayInvests', lastTransactions);

    // Investments net TVL value
    let netTvl = 0;
    lastTransactions.forEach(invest =>
      invest.type === 'Join'
        ? (netTvl += getPoolInvestmentValue(invest.amounts))
        : (netTvl -= getPoolInvestmentValue(invest.amounts))
    );

    // Largest investment value
    const largestInvestment =
      lastInvestments.length > 0
        ? lastInvestments.reduce((prev, current) => {
            return getPoolInvestmentValue(prev.amounts) >
              getPoolInvestmentValue(current.amounts)
              ? prev
              : current;
          })
        : null;

    const largestValue = largestInvestment
      ? fNum2(
          getPoolInvestmentValue(largestInvestment.amounts),
          TRANSACTION_NUM_STYLE
        )
      : fNum2(0, TRANSACTION_NUM_STYLE);

    // Investments average value
    const avgValue =
      lastInvestments.length > 0
        ? lastInvestments.reduce(
            (total, current) =>
              total + Number(getPoolInvestmentValue(current.amounts)),
            0
          ) / lastTransactions.length
        : 0;

    // Investments net value
    let netInvestments = 0;
    lastTransactions.forEach(invest =>
      invest.type === 'Join' ? (netInvestments += 1) : (netInvestments -= 1)
    );

    return [
      {
        label: t('poolTransactionStats.investment.netTvl', { period }),
        value: fNum2(netTvl, TRANSACTION_NUM_STYLE)
      },
      {
        label: t('poolTransactionStats.investment.largest', { period }),
        value: largestValue
      },
      {
        label: t('poolTransactionStats.investment.ave', { period }),
        value: fNum2(avgValue, TRANSACTION_NUM_STYLE)
      },
      {
        label: t('poolTransactionStats.investment.net', { period }),
        value: `${netInvestments > 0 ? '+' : ''}${netInvestments}`
      }
    ];
  });

  const tradeTransactionsStats = computed(() => {
    return [];
  });

  return {
    getPoolInvestmentValue,
    investTransactionStats,
    tradeTransactionsStats
  };
}
