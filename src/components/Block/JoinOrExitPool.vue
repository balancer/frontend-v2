<template>
  <Block :slim="true">
    <div class="d-flex d-block bg-gray-dark rounded-top-0 rounded-md-top-2">
      <a
        @click="currentSide = 0"
        :class="currentSide === 0 && 'active border-green'"
        class="col-6 pt-3 text-center border-bottom"
        style="padding-bottom: 10px;"
      >
        <h4>Buy</h4>
      </a>
      <a
        @click="currentSide = 1"
        :class="currentSide === 1 && 'active border-red'"
        class="col-6 pt-3 text-center border-bottom"
        style="padding-bottom: 10px;"
      >
        <h4>Sell</h4>
      </a>
    </div>
    <div class="p-4">
      <ExchangerJoinPool
        v-if="currentSide === 0"
        @submit="$emit('submit', $event)"
        :tokens="tokens"
        :pool="pool"
      />
      <ExchangerExitPool
        v-if="currentSide === 1"
        @submit="$emit('submit', $event)"
        :tokens="tokens"
        :pool="pool"
      />
    </div>
  </Block>
</template>

<script>
export default {
  props: {
    tokens: Object,
    pool: Object
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
