<template>
  <BalCard
    class="overflow-x-auto whitespace-nowrap"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="tableData"
      :isLoading="loading"
      skeletonClass="h-64"
      sticky="both"
      :initialState="{
        sortColumn: 'weight',
        sortDirection: 'desc',
      }"
    >
      <template #tokenColumnCell="token">
        <div class="flex flex-row py-4 px-6">
          <BalLink
            :href="explorer.addressLink(token.address)"
            external
            noStyle
            class="flex items-center w-full"
          >
            <div>
              <BalAsset :address="token.address" :size="36" />
            </div>
            <div
              class="overflow-hidden pl-4 font-medium truncate eth-address text-ellipsis"
            >
              {{ symbolFor(token.address) }}
            </div>
            <BalIcon
              name="arrow-up-right"
              size="sm"
              class="ml-2 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            />
          </BalLink>
        </div>
      </template>
      <template #tokenWeightCell="token">
        <div class="py-4 px-6 text-right font-numeric">
          {{ weightFor(token.address) }}
        </div>
      </template>
      <template #tokenBalanceCell="token">
        <div class="py-4 px-6 text-right font-numeric">
          {{ balanceFor(token.address) }}
        </div>
      </template>
      <template #tokenValueCell="token">
        <div class="py-4 px-6 text-right font-numeric">
          {{ fiatValueFor(token.address) }}
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import numeral from 'numeral';
import { computed, defineComponent, PropType, Ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { shortenLabel } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { ColumnDefinition } from '@/components/_global/BalTable/types';
export default defineComponent({
  props: {
    pool: {
      type: Object as PropType<Pool>,
      required: true,
    },
    loading: { type: Boolean, default: false },
  },
  setup(props) {
    /**
     * STATE
     */
    const { pool }: { pool: Ref<Pool> } = toRefs(props);

    /**
     * COMPOSABLES
     */
    const { fNum2 } = useNumbers();
    const { explorerLinks } = useWeb3();
    const { t } = useI18n();
    const { upToLargeBreakpoint } = useBreakpoints();
    const { priceFor } = useTokens();
    const { isStableLikePool } = usePool(pool);

    /**
     * COMPUTED
     */
    const tableData = computed(() => {
      if (!pool || !pool.value || props.loading) return [];
      const onchainTokens = pool.value?.onchain?.tokens || [];
      return Object.keys(onchainTokens).map((address, index) => ({
        address,
        index,
      }));
    });

    const columns = computed<ColumnDefinition[]>(() => [
      {
        name: t('token'),
        id: 'token',
        accessor: 'address',
        Cell: 'tokenColumnCell',
        width: 175,
      },
      {
        name: t('weight'),
        id: 'weight',
        accessor: 'index',
        Cell: 'tokenWeightCell',
        align: 'right',
        sortKey: pool => weightFor(pool.address),
        width: 125,
        hidden: !props.loading && isStableLikePool.value,
      },
      {
        name: t('balance'),
        id: 'balance',
        accessor: 'index',
        Cell: 'tokenBalanceCell',
        align: 'right',
        sortKey: pool => balanceFor(pool.address),
        width: 125,
      },
      {
        name: t('value'),
        id: 'value',
        accessor: 'index',
        Cell: 'tokenValueCell',
        align: 'right',
        sortKey: pool => numeral(fiatValueFor(pool.address)).value(),
        width: 125,
      },
    ]);

    /**
     * METHODS
     */
    function symbolFor(address: string) {
      if (!pool || !pool.value) return '-';
      const symbol = pool.value?.onchain?.tokens?.[address]?.symbol;
      return symbol ? symbol : shortenLabel(address);
    }

    function balanceFor(address: string): string {
      if (!pool || !pool.value) return '-';
      const balance = pool.value?.onchain?.tokens[address]?.balance;
      return balance ? fNum2(balance, FNumFormats.token) : '-';
    }

    function weightFor(address: string): string {
      if (!pool || !pool.value) return '-';
      const weight = pool.value?.onchain?.tokens[address]?.weight;
      return weight ? fNum2(weight, FNumFormats.percent) : '-';
    }

    function fiatValueFor(address: string): string {
      const price = priceFor(address);
      if (!pool || !pool.value || price === 0) return '-';

      const balance = pool.value?.onchain?.tokens[address]?.balance;
      return balance ? fNum2(Number(balance) * price, FNumFormats.fiat) : '-';
    }

    return {
      symbolFor,
      balanceFor,
      weightFor,
      fiatValueFor,
      fNum2,
      explorer: explorerLinks,
      columns,
      tableData,
      upToLargeBreakpoint,
    };
  },
});
</script>
