<template>
  <BalCard shadow="lg" class="mt-8" no-pad>
    <BalTable
      :columns="columns"
      :data="data"
      :isLoading="isLoading"
      skeletonClass="h-64"
      sticky="both"
      :onRowClick="
        pool => {
          router.push({ name: 'pool', params: { id: pool.id } });
        }
      "
    >
      <template v-slot:iconColumnHeader>
        <div class="flex items-center">
          <img :src="require('@/assets/icons/token_header.svg')" />
        </div>
      </template>
      <template v-slot:iconColumnCell="pool">
        <div class="px-6 py-8 flex flex-row icon">
          <div
            v-for="(token, i) in tokensFor(pool)"
            class="z-10 absolute"
            :key="token"
            :style="{
              left: `${getIconPosition(i, pool.tokens.length)}px`
            }"
          >
            <BalAsset :address="token" />
          </div>
        </div>
      </template>
      <template v-slot:poolNameCell="pool">
        <div class="px-6 py-8 -mt-1 flex flex-wrap">
          <div
            v-for="token in pool.tokens"
            :key="token"
            class="mr-2 mb-2 flex items-center p-1 bg-gray-50 rounded-lg"
          >
            <span>
              {{ allTokens[getAddress(token.address)]?.symbol }}
            </span>
            <span class="font-medium text-gray-400 text-xs mt-px ml-1">
              {{ fNum(token.weight, 'percent_lg') }}
            </span>
          </div>
        </div>
      </template>
    </BalTable>
    <div
      v-if="!isLoading && data.length === 0"
      class="h-40 border-t -mt-px flex items-center justify-center text-gray-500 font-medium"
    >
      {{ noPoolsLabel }}
    </div>
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { DecoratedPoolWithShares } from '@/services/balancer/subgraph/types';

import { getAddress } from '@ethersproject/address';

import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import useBreakpoints from '@/composables/useBreakpoints';

import { ColumnDefinition } from '../_global/BalTable/BalTable.vue';

export default defineComponent({
  props: {
    data: {
      type: Array
    },
    isLoading: {
      type: Boolean
    },
    showPoolShares: {
      type: Boolean,
      default: false
    },
    noPoolsLabel: {
      type: String,
      default: 'No pools'
    }
  },
  setup(props) {
    const { fNum } = useNumbers();
    const { allTokens } = useTokens();
    const router = useRouter();
    const { t } = useI18n();
    const { bp } = useBreakpoints();

    // COMPOSABLES
    const columns = ref<ColumnDefinition<DecoratedPoolWithShares>[]>([
      {
        name: 'Icons',
        id: 'icons',
        accessor: 'uri',
        Header: 'iconColumnHeader',
        Cell: 'iconColumnCell',
        className: 'w-32 md:w-36 lg:w-40',
        noGrow: true
      },
      {
        name: t('poolName'),
        id: 'poolName',
        accessor: 'id',
        Cell: 'poolNameCell',
        className: 'w-72'
      },
      {
        name: t('myBalance'),
        accessor: pool => fNum(pool.shares, 'usd', { forcePreset: true }),
        className: 'cell',
        align: 'right',
        id: 'myBalance',
        hidden: !props.showPoolShares
      },
      {
        name: t('poolValue'),
        accessor: pool => fNum(pool.totalLiquidity, 'usd'),
        className: 'w-32',
        align: 'right',
        id: 'poolValue'
      },
      {
        name: t('volume24h', [t('hourAbbrev')]),
        accessor: pool => fNum(pool.dynamic.volume, 'usd'),
        className: 'w-32',
        align: 'right',
        id: 'poolVolume'
      },
      {
        name: t('apy', [t('yearAbbrev')]),
        accessor: pool => `${fNum(pool.dynamic.apy, 'percent')}`,
        className: 'w-32',
        align: 'right',
        id: 'poolApy'
      }
    ]);

    function tokensFor(pool: DecoratedPoolWithShares) {
      return pool.tokensList.map(getAddress);
    }

    function getIconPosition(i: number, count: number) {
      if (count < 3) return 28 * i + 24;
      if (count === 3) return 24 * i + 24;

      if (['sm', 'md'].includes(bp.value)) return (48 * i) / (count - 1) + 24;
      if (bp.value === 'lg') return (72 * i) / (count - 1) + 24;
      return (96 * i) / (count - 1) + 24;
    }

    return {
      // data
      columns,
      allTokens,

      // methods
      router,
      getAddress,
      tokensFor,
      getIconPosition,
      fNum
    };
  }
});
</script>
