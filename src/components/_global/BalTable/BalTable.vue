<template>
  <table class="min-w-full">
    <thead class="bg-gray-50 dark:bg-gray-700">
      <slot name="headers">
        <th
          v-for="(header, i) in headers"
          :key="i"
          v-text="header"
          class="sticky top-0 p-2 pl-5 py-5 text-left"
        />
      </slot>
    </thead>
    <slot></slot>
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
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'BalTable',

  props: {
    headers: { type: Array as PropType<string[]>, default: () => [] }
  }
});
</script>
