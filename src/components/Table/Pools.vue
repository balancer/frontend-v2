<template>
  <BalCard :title="$t('investmentPools')">
    <div class="flex">
      <BalBtn
        color="primary"
        size="sm"
        :label="$t('filter')"
        outline
        @click.prevent="selectTokenModal = true"
      />
      <div class="flex ml-4">
        <BalChip
          v-for="(token, i) in selectedTokens"
          class="mr-2"
          :key="token"
          size="md"
          color="gray"
          :closeable="true"
          @closed="removeToken(i)"
        >
          <Token
            :token="allTokens[token]"
            :symbol="false"
            :size="20"
            class="flex-auto"
          />
          <span class="ml-1">{{ allTokens[token].symbol }}</span>
        </BalChip>
      </div>
    </div>
    <div class="mt-2 overflow-x-auto whitespace-nowrap border rounded-lg">
      <table class="min-w-full text-black bg-white dark:bg-gray-900">
        <tr class="bg-gray-50 dark:bg-gray-700">
          <th
            v-text="$t('poolName')"
            class="sticky top-0 p-2 pl-5 py-5 text-left"
          />
          <th
            v-text="$t('poolValue')"
            class="sticky top-0 p-2 py-5 text-right"
          />
          <th
            v-text="$t('volume24h', [$t('hourAbbrev')])"
            class="sticky top-0 p-2 py-5 text-right"
          />
          <th
            v-text="$t('apy', [$t('yearAbbrev')])"
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
            {{ _num(stats[pool.id].apy, '0,0%') }}
          </td>
        </tr>
      </table>
    </div>
    <teleport to="#modal">
      <SelectTokenModal
        v-if="!registry.loading"
        :open="selectTokenModal"
        :excluded-tokens="selectedTokens"
        @close="selectTokenModal = false"
        @select="addToken"
      />
    </teleport>
  </BalCard>
</template>

<script lang="ts">
import { PropType, defineComponent, toRefs, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { getAddress } from '@ethersproject/address';
import { getPoolLiquidity } from '@/utils/balancer/price';
import { Pool } from '@/api/subgraph';
import SelectTokenModal from '@/components/modals/SelectTokenModal.vue';

export default defineComponent({
  components: {
    SelectTokenModal
  },

  props: {
    pools: {
      type: Array as PropType<Pool[]>,
      required: true
    }
  },

  setup(props) {
    const store = useStore();
    const { pools } = toRefs(props);

    const selectTokenModal = ref(false);
    const selectedTokens = ref<string[]>([]);

    const allTokens = computed(() => store.getters.getTokens());
    function addToken(token: string) {
      selectedTokens.value.push(token);
    }

    function removeToken(i: number) {
      selectedTokens.value.splice(i);
    }

    const filteredPools = computed(() => {
      return pools.value.filter(pool =>
        selectedTokens.value.every(token =>
          pool.tokens.map(token => token.address).includes(token.toLowerCase())
        )
      );
    });

    const stats = computed(() => {
      const stats = Object.fromEntries(
        pools.value.map(pool => {
          const liquidity = getPoolLiquidity(pool, store.state.market.prices);
          const poolStats = {
            liquidity,
            volume: '0',
            apy: '0'
          };
          return [pool.id, poolStats];
        })
      );
      return stats;
    });

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
      getAddress,

      allTokens,

      addToken,
      removeToken,

      selectedTokens,
      selectTokenModal,

      filteredPools,
      stats,

      getIconPosition
    };
  }
});
</script>
