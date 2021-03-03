<template>
  <Block :slim="true">
    <div class="flex block bg-gray-dark md:rounded-t-md">
      <a
        @click="currentSide = 0"
        :class="currentSide === 0 ? 'active border-green-500' : 'border-b'"
        class="w-1/2 pt-3 pb-2 text-center md:rounded-t-md"
      >
        <h4 v-text="$t('buy')" />
      </a>
      <a
        @click="currentSide = 1"
        :class="currentSide === 1 ? 'active border-red-500' : 'border-b'"
        class="w-1/2 pt-3 pb-2 text-center"
      >
        <h4 v-text="$t('sell')" />
      </a>
    </div>
    <div class="p-5">
      <Exchanger
        :key="currentSide"
        v-if="currentSide === 0"
        :requireAllowance="!hasAllowed"
        :tokens="tokens"
        :sendTokens="pool.tokens"
        :sendRatios="pool.tokenBalances"
        :receiveTokens="[pool.address]"
        :receiveRatios="[pool.totalSupply]"
        @submit="$emit('joinPool', $event)"
        @approve="$emit('approve', $event)"
        :submit="$t('buy')"
      />
      <Exchanger
        :key="currentSide"
        v-if="currentSide === 1"
        :tokens="tokens"
        :sendTokens="[pool.address]"
        :sendRatios="[pool.totalSupply]"
        :receiveTokens="pool.tokens"
        :receiveRatios="pool.tokenBalances"
        @submit="$emit('exitPool', $event)"
        :submit="$t('sell')"
      />
    </div>
  </Block>
</template>

<script>
export default {
  props: {
    tokens: Object,
    pool: Object,
    hasAllowed: Boolean
  },
  data() {
    return {
      currentSide: 0
    };
  }
};
</script>

<style scoped lang="css">
.active {
  border-bottom-width: 3px !important;
}
</style>
