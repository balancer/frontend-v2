<template>
  <Block :slim="true">
    <div class="d-flex d-block bg-gray-dark rounded-top-0 rounded-md-top-2">
      <a
        @click="currentSide = 0"
        :class="currentSide === 0 && 'active border-green'"
        class="col-6 pt-3 text-center border-bottom"
        style="padding-bottom: 10px;"
      >
        <h4 v-text="$t('buy')" />
      </a>
      <a
        @click="currentSide = 1"
        :class="currentSide === 1 && 'active border-red'"
        class="col-6 pt-3 text-center border-bottom"
        style="padding-bottom: 10px;"
      >
        <h4 v-text="$t('sell')" />
      </a>
    </div>
    <div class="p-4">
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

<style scoped lang="scss">
.active {
  border-bottom-width: 3px !important;
}
</style>
