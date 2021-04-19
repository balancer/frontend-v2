<template>
  <BalCard class="overflow-x-auto whitespace-nowrap" no-pad>
    <table class="min-w-full">
      <tr class="bg-gray-50 dark:bg-gray-700">
        <th
          v-text="t('poolName')"
          class="sticky top-0 p-2 pl-5 py-5 text-left"
        />
        <th v-text="t('poolValue')" class="sticky top-0 p-2 py-5 text-right" />
        <th
          v-text="t('volume24h', [t('hourAbbrev')])"
          class="sticky top-0 p-2 py-5 text-right"
        />
        <th
          v-text="t('apy', [t('yearAbbrev')])"
          class="sticky top-0 p-2 pr-5 py-5 text-right"
        />
      </tr>
      <tr
        class="cursor-default hover:bg-gray-50"
        v-for="pool in filteredPools"
        :key="pool.address"
      >
        <td class="p-2 pl-5 py-5 flex">
          <div class="w-20 relative">
            <span
              v-for="(token, i) in pool.tokens"
              :key="token.address"
              class="hover:z-10 absolute"
              :style="{
                left: `${getIconPosition(i, pool.tokens.length)}px`
              }"
            >
              <Token :token="allTokens[getAddress(token.address)]" />
            </span>
          </div>
          <router-link :to="{ name: 'pool', params: { id: pool.id } }">
            <div>
              <span
                class="ml-2"
                v-for="token in pool.tokens"
                :key="token.address"
              >
                {{ _num(token.weight, '0%') }}
                {{ allTokens[getAddress(token.address)].symbol }}
              </span>
            </div>
          </router-link>
        </td>
        <td class="p-2 py-5 text-right">
          {{ _num(stats[pool.id].liquidity, '$0,0') }}
        </td>
        <td class="p-2 py-5 text-right">
          {{ _num(stats[pool.id].volume, '$0,0') }}
        </td>
        <td class="p-2 pr-5 py-5 text-right">
          {{ _num(stats[pool.id].apy, '0,0.[00]%') }}
        </td>
      </tr>
    </table>
  </BalCard>
</template>

<script lang="ts">
import { PropType, defineComponent, toRefs, computed } from 'vue';
import { useStore } from 'vuex';
import { getAddress } from '@ethersproject/address';
import { getPoolLiquidity } from '@/utils/balancer/price';
import { Pool, PoolSnapshot } from '@/api/subgraph';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    pools: {
      type: Array as PropType<Pool[]>,
      required: true
    },
    snapshots: {
      type: Array as PropType<PoolSnapshot[]>,
      required: true
    },
    selectedTokens: { type: Array as PropType<string[]>, default: () => [] }
  },

  setup(props) {
    // COMPOSABLES
    const store = useStore();
    const { pools, snapshots } = toRefs(props);
    const { t } = useI18n();

    // COMPUTED
    const allTokens = computed(() => store.getters['registry/getTokens']());

    const filteredPools = computed(() => {
      return pools.value.filter(pool =>
        props.selectedTokens.every(token =>
          pool.tokens.map(token => token.address).includes(token.toLowerCase())
        )
      );
    });

    const stats = computed(() => {
      const stats = Object.fromEntries(
        pools.value.map(pool => {
          const liquidity = getPoolLiquidity(pool, store.state.market.prices);
          const snapshot = snapshots.value.find(
            snapshot => snapshot.pool.id === pool.id
          );
          const volume = snapshot ? snapshot.swapVolume : '0';
          const apy = snapshot
            ? (parseFloat(snapshot.swapFees) / parseFloat(liquidity)) * 365
            : '0';
          const poolStats = {
            liquidity,
            volume,
            apy
          };
          return [pool.id, poolStats];
        })
      );
      return stats;
    });

    // METHODS
    function getIconPosition(i: number, count: number) {
      if (count < 3) {
        return 28 * i;
      }
      if (count === 3) {
        return 24 * i;
      }
      return (48 * i) / (count - 1);
    }

    return {
      // computed
      allTokens,
      filteredPools,
      stats,

      // methods
      getAddress,
      getIconPosition,
      t
    };
  }
});
</script>
