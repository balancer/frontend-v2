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
            <Token :token="allTokens[token]" />
          </div>
        </div>
      </template>
      <template v-slot:poolNameCell="pool">
        <div class="px-6 py-8">
          <span
            v-for="token in pool.tokens"
            :key="token"
            class="inline-block mr-1"
          >
            <span class="dot">•</span>
            {{ fNum(token.weight, 'percent') }}
            {{ allTokens[getAddress(token.address)].symbol }}
          </span>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { getAddress } from '@ethersproject/address';
import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { useRouter } from 'vue-router';

export default defineComponent({
  props: {
    data: {
      type: Array
    },
    isLoading: {
      type: Boolean
    }
  },
  setup() {
    const { fNum } = useNumbers();
    const { allTokens } = useTokens();
    const router = useRouter();

    // COMPOSABLES
    const columns = ref([
      {
        name: 'Icons',
        id: 'icons',
        accessor: 'uri',
        Header: 'iconColumnHeader',
        Cell: 'iconColumnCell',
        className: 'cell'
      },
      {
        name: 'Pool Name',
        id: 'poolName',
        accessor: 'id',
        Cell: 'poolNameCell',
        className: 'w-full'
      },
      {
        name: 'Pool Value',
        accessor: pool => fNum(pool.liquidity, 'usd'),
        className: 'cell',
        align: 'right',
        id: 'poolValue'
      },
      {
        name: 'Vol (24h)',
        accessor: pool => fNum(pool.volume, 'usd'),
        className: 'cell',
        align: 'right',
        id: 'poolVolume'
      },
      {
        name: 'APY (1y)',
        accessor: pool => `${fNum(pool.apy, 'percent')}`,
        className: 'cell',
        align: 'right',
        id: 'poolApy'
      }
    ]);

    function tokensFor(pool) {
      return pool.tokens.map(token => getAddress(token.address));
    }

    function getIconPosition(i: number, count: number) {
      if (count < 3) {
        return 28 * i + 24;
      }
      if (count === 3) {
        return 24 * i + 24;
      }
      return (48 * i) / (count - 1) + 24;
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
