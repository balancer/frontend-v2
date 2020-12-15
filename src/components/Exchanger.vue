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
export default {
  props: {
    tokens: Object,
    sendTokens: Array,
    receiveTokens: Array,
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
    }
  }
};
</script>
