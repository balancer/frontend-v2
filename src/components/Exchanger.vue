<template>
  <div>
    <div class="mb-3">
      <div class="mb-2">
        {{ $t('send') }}
        <a @click="onMax">
          <UiLabel v-text="$t('max')" class="float-right" />
        </a>
      </div>
      <UiButton
        v-for="(token, i) in sendTokens"
        :key="token"
        :class="{
          'border-red': parseFloat(sendAmounts[i]) > tokens[token].balance
        }"
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
        <div>
          {{ _shorten(tokens[token].symbol, 'symbol') }}
        </div>
      </UiButton>
    </div>
    <div class="mb-3">
      <div v-text="$t('receive')" class="mb-2" />
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
        <div>
          {{ _shorten(tokens[token].symbol, 'symbol') }}
        </div>
      </UiButton>
    </div>
    <UiButton
      v-if="requireAllowance && Object.keys(requiredAllowances).length > 0"
      @click="onApprove"
      class="button--submit width-full"
    >
      {{ $t('approve') }}
    </UiButton>
    <UiButton v-else @click="onSubmit" class="button--submit width-full">
      {{ submit }}
    </UiButton>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { parseUnits } from '@ethersproject/units';
import PoolAdapter from '@/utils/balancer/adapters/pool';

export default {
  props: {
    requireAllowance: Boolean,
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
  computed: {
    ...mapGetters(['getRequiredAllowances']),
    requiredAllowances() {
      const tokens = Object.fromEntries(
        this.sendTokens.map((token, i) => {
          const amount = this.sendAmounts?.[i] || '0';
          return [
            token,
            parseUnits(amount, this.tokens[token].decimals).toString()
          ];
        })
      );
      return this.getRequiredAllowances({ tokens });
    }
  },
  methods: {
    onSubmit() {
      this.$emit('submit', {
        sendAmounts: this.sendAmounts,
        receiveAmounts: this.receiveAmounts
      });
    },
    onApprove() {
      this.$emit('approve', this.requiredAllowances);
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
      const amounts = adapter.calcAmountsWith(type, index, currentAmount);
      if (amounts) {
        const { sendAmounts, receiveAmounts } = amounts;
        this.sendAmounts = sendAmounts;
        this.receiveAmounts = receiveAmounts;
      }
    },
    onMax() {
      const adapter = new PoolAdapter(
        this.tokens,
        this.sendTokens,
        this.receiveTokens,
        this.sendRatios,
        this.receiveRatios
      );
      const { sendAmounts, receiveAmounts } = adapter.calcAmountsMax();
      this.sendAmounts = sendAmounts;
      this.receiveAmounts = receiveAmounts;
    }
  }
};
</script>
