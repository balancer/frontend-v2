import { getAddress } from '@ethersproject/address';
import differenceInDays from 'date-fns/differenceInDays';
import { computed, ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';

import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import {
  FullPool,
  PoolActivity,
  PoolSwap
} from '@/services/balancer/subgraph/types';

import useNumbers, { FNumFormats } from '../useNumbers';

const TRANSACTION_NUM_STYLE = {
  style: 'currency',
  abbreviate: true,
  fixedFormat: true
};

enum TransactionPeriod {
  DAY = '(24h)',
  WEEK = '(7d)'
}

export default function usePoolTransactionStats(
  pool: ComputedRef<FullPool>,
  poolInvestTransactions?: ComputedRef<PoolActivity[]>,
  poolTradeTransactions?: ComputedRef<PoolSwap[]>
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

  function getPoolInvestmentDetails(amounts: PoolActivity['amounts']) {
    return amounts.map((amount, index) => {
      const address = getAddress(pool.value.tokensList[index]);
      const token = tokens.value[address];
      const symbol = token ? token.symbol : address;
      const amountNumber = parseFloat(amount);

      return {
        address,
        symbol,
        amount: fNum2(amountNumber, FNumFormats.token)
      };
    });
  }

  const investTransactionStats = computed(() => {
    if (!pool.value || !poolInvestTransactions?.value) {
      return [];
    }

    const poolInvestmentsLength = poolInvestTransactions.value.length;

    if (poolInvestmentsLength === 0) {
      return [];
    }

    let lastTransactions: PoolActivity[] = [];
    let period = TransactionPeriod.DAY;
    const lastDayInvests = poolInvestTransactions.value.filter(
      invest => differenceInDays(new Date(), new Date(invest.timestamp)) < 1
    );

    // If there are less than 3 invests during last day, use the last week invests.
    if (lastDayInvests.length >= 3) {
      lastTransactions = lastDayInvests;
    } else {
      period = TransactionPeriod.WEEK;
      lastTransactions = poolInvestTransactions.value.filter(
        invest => differenceInDays(new Date(), new Date(invest.timestamp)) < 7
      );
    }

    if (lastTransactions.length === 0) {
      return [];
    }

    const lastInvestments = lastTransactions.filter(
      transaction => transaction.type === 'Join'
    );

    // Investments net TVL value
    const netTvl = lastTransactions.reduce(
      (total, invest) =>
        invest.type === 'Join'
          ? (total += getPoolInvestmentValue(invest.amounts))
          : (total -= getPoolInvestmentValue(invest.amounts)),
      0
    );

    // Largest investment value
    const largestInvestment =
      lastInvestments.length > 0
        ? lastInvestments.reduce((prev, current) =>
            getPoolInvestmentValue(prev.amounts) >
            getPoolInvestmentValue(current.amounts)
              ? prev
              : current
          )
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

  const tradeTransactionStats = computed(() => {
    if (!pool.value || !poolTradeTransactions?.value) {
      return [];
    }

    if (poolTradeTransactions.value.length === 0) {
      return [];
    }

    let lastTrades: PoolSwap[];
    let period = TransactionPeriod.DAY;
    const lastDayTrades = poolTradeTransactions.value.filter(
      trade => differenceInDays(new Date(), new Date(trade.timestamp)) < 1
    );

    // If there are less than 3 trades during last day, use the last week trades.
    if (lastDayTrades.length >= 3) {
      lastTrades = lastDayTrades;
    } else {
      period = TransactionPeriod.WEEK;
      lastTrades = poolTradeTransactions.value.filter(
        trade => differenceInDays(new Date(), new Date(trade.timestamp)) < 7
      );
    }

    if (lastTrades.length === 0) {
      return [];
    }

    // Trades volume
    const tradeSum = lastTrades.reduce(
      (total, current) => (total += Number(current.tokenAmountOut)),
      0
    );

    // Largest trade value
    const largestTrade = lastTrades.reduce((prev, current) =>
      Number(prev.tokenAmountOut) > Number(current.tokenAmountOut)
        ? prev
        : current
    );

    // Trades average value
    const avgValue =
      lastTrades.reduce(
        (total, current) => total + Number(current.tokenAmountOut),
        0
      ) / lastTrades.length;

    return [
      {
        label: t('poolTransactionStats.trade.volume', { period }),
        value: fNum2(
          bnum(priceFor(largestTrade.tokenOut))
            .times(tradeSum)
            .toNumber(),
          TRANSACTION_NUM_STYLE
        )
      },
      {
        label: t('poolTransactionStats.trade.largest', { period }),
        value: fNum2(
          bnum(priceFor(largestTrade.tokenOut))
            .times(largestTrade.tokenAmountOut)
            .toNumber(),
          TRANSACTION_NUM_STYLE
        )
      },
      {
        label: t('poolTransactionStats.trade.ave', { period }),
        value: fNum2(
          bnum(priceFor(largestTrade.tokenOut))
            .times(avgValue)
            .toNumber(),
          TRANSACTION_NUM_STYLE
        )
      },
      {
        label: t('poolTransactionStats.trade.total', { period }),
        value: fNum2(lastTrades.length, { abbreviate: true })
      }
    ];
  });

  return {
    getPoolInvestmentValue,
    getPoolInvestmentDetails,
    investTransactionStats,
    tradeTransactionStats
  };
}
