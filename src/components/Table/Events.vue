<template>
  <BalCard
    v-if="actions.length > 0"
    class="overflow-x-auto whitespace-nowrap"
    no-pad
  >
    <table class="min-w-full dark:bg-gray-900">
      <tr class="bg-gray-50 dark:bg-gray-700">
        <th
          v-text="$t('action')"
          class="sticky top-0 p-2 pl-5 py-5 text-left"
        />
        <th v-text="$t('value')" class="sticky top-0 p-2 py-5 text-right" />
        <th v-text="$t('details')" class="sticky top-0 p-2 py-5 text-right" />
        <th v-text="$t('date')" class="sticky top-0 p-2 pr-5 py-5 text-right" />
      </tr>
      <tr class="hover:bg-gray-50" v-for="action in actions" :key="action.tx">
        <td class="p-2 pl-5 py-5 flex items-center text-left">
          {{ action.label }}
          <a :href="_explorer(networkId, action.tx, 'tx')" target="_blank">
            <BalIcon name="external-link" size="sm" class="ml-2" />
          </a>
        </td>
        <td class="p-2 py-5 text-right">
          {{ fNum(action.value, 'usd') }}
        </td>
        <td class="p-2 py-5 text-right">
          {{ action.details }}
        </td>
        <td class="p-2 pr-5 py-5 text-right">
          {{ formatDate(action.timestamp) }}
        </td>
      </tr>
    </table>
  </BalCard>
</template>

<script lang="ts">
import { PropType, computed } from 'vue';
import { useStore } from 'vuex';

import { PoolJoin, PoolExit, PoolEvents } from '@/api/subgraph';
import useNumbers from '@/composables/useNumbers';
import { useI18n } from 'vue-i18n';

interface Action {
  label: string;
  value: number;
  details: string;
  timestamp: number;
  tx: string;
}

export default {
  props: {
    tokens: {
      type: Object as PropType<string[]>,
      required: true
    },
    events: {
      type: Object as PropType<PoolEvents>,
      required: true
    }
  },

  setup(props) {
    const store = useStore();
    const { fNum } = useNumbers();
    const { t } = useI18n();

    const allTokens = computed(() => store.getters['registry/getTokens']());

    const networkId = computed(() => store.state.web3.config.chainId);

    const actions = computed<Action[]>(() => {
      if (!Object.keys(props.events)) {
        return [];
      }

      const joinActions = props.events.joins.map(join => {
        return {
          label: t('investment'),
          value: getJoinExitValue(join),
          details: getJoinExitDetails(join),
          timestamp: join.timestamp,
          tx: join.tx
        };
      });
      const exitActions = props.events.exits.map(exit => {
        return {
          label: t('withdrawal'),
          value: getJoinExitValue(exit),
          details: getJoinExitDetails(exit),
          timestamp: exit.timestamp,
          tx: exit.tx
        };
      });
      const actions = [...joinActions, ...exitActions];
      actions.sort((a, b) => b.timestamp - a.timestamp);
      return actions;
    });

    function formatDate(timestamp: number) {
      const date = new Date(timestamp * 1000);
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long'
      };
      return date.toLocaleString('en-US', dateOptions);
    }

    function getJoinExitValue(event: PoolJoin | PoolExit) {
      const value = event.amounts.reduce((total, amount, index) => {
        const address = props.tokens[index];
        const token = allTokens.value[address];
        const price = token.price || 0;
        const amountNumber = parseFloat(amount);
        return total + amountNumber * price;
      }, 0);
      return value;
    }

    function getJoinExitDetails(event: PoolJoin | PoolExit) {
      const tokenLabels = event.amounts
        .map((amount, index) => {
          const address = props.tokens[index];
          const token = allTokens.value[address];
          const symbol = token ? token.symbol : address;
          const amountNumber = parseFloat(amount);
          return `${amountNumber.toFixed(2)} ${symbol}`;
        })
        .join(' ');
      return tokenLabels;
    }

    return {
      actions,
      formatDate,
      networkId,
      fNum
    };
  }
};
</script>
