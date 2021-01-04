<template>
  <div>
    <div class="mb-3">
      <div class="mb-2">
        Send
        <UiLabel class="float-right">Max</UiLabel>
      </div>
      <UiButton
        v-for="(token, i) in sendTokens"
        :key="token"
        class="d-flex mb-2 width-full px-3"
      >
        <input
          @input="onInput('send', i)"
          v-model="sendAmounts[i]"
          class="input flex-auto"
          type="number"
          placeholder="0.0"
          required
        />
        <div class="pl-2">
          {{ _shorten(tokens[token].symbol, 'symbol') }}
        </div>
      </UiButton>
    </div>
    <div class="mb-3">
      <div class="mb-2">Receive</div>
      <UiButton
        v-for="(token, i) in receiveTokens"
        :key="token"
        class="d-flex mb-2 width-full px-3"
      >
        <input
          @input="onInput('receive', i)"
          v-model="receiveAmounts[i]"
          class="input flex-auto"
          type="number"
          placeholder="0.0"
          required
        />
        <div class="pl-2">
          {{ _shorten(tokens[token].symbol, 'symbol') }}
        </div>
      </UiButton>
    </div>
    <UiButton @click="onSubmit" class="button--submit width-full">
      {{ submit }}
    </UiButton>
  </div>
</template>

<script>
import PoolAdapter from '@/utils/balancer/adapters/pool';

export default {
  props: {
    tokens: Object,
    sendTokens: Array,
    sendRatios: Array,
    receiveTokens: Array,
    receiveRatios: Array,
    submit: String
  },
  data() {
    return {
      sendAmounts: [],
      receiveAmounts: []
    };
  },
  methods: {
    onSubmit() {
      this.$emit('submit', {
        sendAmounts: this.sendAmounts,
        receiveAmounts: this.receiveAmounts
      });
    },
    onInput(type, index) {
      const currentAmount = this[`${type}Amounts`][index];
      const adapter = new PoolAdapter(
        this.tokens,
        this.sendTokens,
        this.receiveTokens,
        this.sendRatios,
        this.receiveRatios
      );
      const { sendAmounts, receiveAmounts } = adapter.calcAmountsWith(
        type,
        index,
        currentAmount
      );
      this.sendAmounts = sendAmounts;
      this.receiveAmounts = receiveAmounts;
    }
  }
};
</script>
