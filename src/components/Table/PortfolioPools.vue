<template>
  <BalCard
    class="overflow-x-auto whitespace-nowrap"
    v-if="pools && pools.length > 0"
    no-pad
  >
    <table class="min-w-full">
      <tr class="bg-gray-50 dark:bg-gray-700">
        <th
          v-text="t('poolName')"
          class="sticky top-0 p-2 pl-5 py-5 text-left"
        />
        <th v-text="t('myShare')" class="sticky top-0 p-2 py-5 text-right" />
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
        v-for="pool in pools"
        :key="pool.address"
      >
        <td class="p-2 pl-5 py-5 flex">
          <div class="w-20 relative">
            <span
              v-for="(token, i) in pool.tokens"
              :key="token"
              class="hover:z-10 absolute"
              :style="{
                left: `${getIconPosition(i, pool.tokens.length)}px`
              }"
            >
              <Token :token="tokens[token]" v-if="tokens[token]" />
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
                {{ tokens[token]?.symbol }}
              </span>
            </div>
          </router-link>
        </td>
        <td class="p-2 py-5 text-right">
          {{ _num(pool.liquidity, '$0,0') }}
        </td>
        <td class="p-2 py-5 text-right">
          {{ _num(pool.volume, '$0,0') }}
        </td>
        <td class="p-2 pr-5 py-5 text-right">
          {{ _num(pool.apy, '0,0.[00]%') }}
        </td>
      </tr>
    </table>
  </BalCard>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAddress } from '@ethersproject/address';
import store from '@/store';

export default defineComponent({
  props: {
    pools: {
      type: Array,
      required: true
    }
  },

  setup() {
    const tokens = computed(() => store.getters['registry/getTokens']());
    const getIconPosition = (i: number, count: number) => {
      if (count < 3) {
        return 28 * i;
      }
      if (count === 3) {
        return 24 * i;
      }
      return (48 * i) / (count - 1);
    };

    const { t } = useI18n();
    return {
      t,
      getIconPosition,
      getAddress,
      tokens
    };
  }
});
</script>
