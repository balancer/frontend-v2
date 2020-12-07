<template>
  <Block title="Buy">
    <div class="mb-3">
      <div class="mb-2">
        Send
        <UiLabel class="float-right">Max</UiLabel>
      </div>
      <UiButton
        v-for="token in sendTokens"
        :key="token.address"
        class="d-flex mb-2 width-full px-3"
      >
        <input
          :value="parseFloat(token.balance) || ''"
          class="input flex-auto"
          type="number"
          placeholder="0.0"
          required
        />
        <div class="pl-2">
          {{ _shorten(token.symbol, 'symbol') }}
        </div>
      </UiButton>
    </div>
    <div class="mb-3">
      <div class="mb-2">Receive</div>
      <UiButton class="d-flex mb-2 width-full px-3">
        <input
          class="input flex-auto"
          type="number"
          placeholder="0.0"
          required
        />
        <div class="pl-2">
          BPT
        </div>
      </UiButton>
    </div>
    <UiButton disabled class="button--submit width-full">
      Buy
    </UiButton>
  </Block>
</template>

<script>
export default {
  props: {
    sendTokens: Array
  }
};
</script>
