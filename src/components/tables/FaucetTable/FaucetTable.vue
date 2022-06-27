<script lang="ts" setup>
import { orderBy } from 'lodash';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import DripBtn from '@/components/btns/DripBtn/DripBtn.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokenLists from '@/composables/useTokenLists';
import useTokens from '@/composables/useTokens';

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();
const { fNum2 } = useNumbers();
const { defaultTokenList } = useTokenLists();
const { priceFor, balanceFor } = useTokens();

const tokens = computed(() => {
  const tokensWithValues = Object.values(defaultTokenList.value.tokens)
    .map(token => {
      const balance = balanceFor(token.address);
      const price = priceFor(token.address);
      const value = Number(balance) * price;
      return {
        ...token,
        price,
        balance,
        value
      };
    })
    .filter(t => t.address != '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');

  return orderBy(tokensWithValues, ['value', 'balance'], ['desc', 'desc']);
});

/**
 * STATE
 */
const columns = ref<ColumnDefinition<any>[]>([
  {
    name: 'Token',
    id: 'token',
    accessor: 'token',
    Cell: 'tokenColumnCell',
    width: 475,
    noGrow: true
  },
  {
    name: t('balance'),
    id: 'Balance',
    align: 'right',
    width: 150,
    accessor: ({ balance }) => `${fNum2(balance, FNumFormats.token)}`
  },
  {
    name: t('value'),
    id: 'value',
    align: 'right',
    width: 150,
    accessor: ({ value }) => fNum2(value, FNumFormats.fiat)
  },
  {
    name: 'Drip',
    id: 'drip',
    align: 'center',
    accessor: 'drip',
    Cell: 'dripColumnCell',
    width: 150
  }
]);
</script>

<template>
  <BalCard
    shadow="lg"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="tokens"
      :isLoading="isLoading"
      skeleton-class="h-64"
      :square="upToLargeBreakpoint"
    >
      <template #tokenColumnCell="{ name, logoURI }">
        <div class="px-6 py-4 flex items-center">
          <BalAsset :iconURI="logoURI" />
          <span class="ml-2">{{ name }}</span>
        </div>
      </template>
      <template #dripColumnCell="{ address }">
        <div class="px-2 py-4 flex justify-center">
          <DripBtn :token="address" />
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>
