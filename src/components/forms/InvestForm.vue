<template>
  <BalForm ref="investForm" @on-submit="submit">
    <BalTextInput
      v-for="(token, i) in pool.tokens"
      :key="token"
      :name="token"
      v-model="amounts[i]"
      :rules="amountRules(i)"
      type="number"
      min="0"
      step="any"
      placeholder="0"
      :disabled="loading"
      validate-on="input"
      @input="onInput($event, i)"
    >
      <template v-slot:prepend>
        <div class="flex items-center w-24">
          <Token :token="allTokens[token]" />
          <div class="flex flex-col ml-3">
            <span class="font-medium text-sm leading-none w-14 truncate">
              {{ allTokens[token].symbol }}
            </span>
            <span class="leading-none text-xs mt-1 text-gray-500">
              {{ formatNum(tokenWeights[i]) }}%
            </span>
          </div>
        </div>
      </template>
      <template v-slot:info>
        <div class="cursor-pointer" @click="onInput(tokenBalance(i), i)">
          {{ infoLabel(i) }}
        </div>
      </template>
    </BalTextInput>

    <BalTextInput
      name="total"
      v-model="total"
      placeholder="$0"
      info="0%"
      :disabled="true"
    >
      <template v-slot:prepend>
        <div class="w-24 flex flex-col">
          <div class="font-medium text-sm leading-none">
            Total
          </div>
          <div class="leading-none text-xs mt-1 text-gray-500">
            Price impact
          </div>
        </div>
      </template>
    </BalTextInput>

    <BalBtn
      v-if="!isAuthenticated"
      label="Connect wallet"
      block
      @click.prevent="connectWallet"
    />
    <template v-else>
      <BalBtn
        v-if="requireApproval"
        label="Allow"
        :loading="approving"
        loading-label="Allowing..."
        :disabled="!hasAmounts"
        block
        @click.prevent="approveAllowances"
      />
      <BalBtn
        v-else
        type="submit"
        label="Invest"
        loading-label="Confirming..."
        color="gradient"
        :disabled="!hasAmounts"
        :loading="loading"
        block
      />
    </template>
  </BalForm>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { FormRef } from '@/types';
import PoolAdapter from '@/utils/balancer/adapters/pool';
import { isPositive, isLessThanOrEqualTo } from '@/utils/validations';
import { useStore } from 'vuex';
import useAuth from '@/composables/useAuth';
import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import useJoinPool from '@/composables/pools/useJoinPool';
import useNumbers from '@/composables/useNumbers';
import useBlocknative from '@/composables/useBlocknative';

export default defineComponent({
  name: 'InvestForm',

  emits: ['success'],

  props: {
    pool: { type: Object, required: true }
  },

  setup(props, { emit }) {
    const investForm = ref({} as FormRef);
    const loading = ref(false);
    const amounts = ref([] as string[]);
    const receiveAmount = ref('');

    // COMPOSABLES
    const store = useStore();
    const notify = useBlocknative();
    const { isAuthenticated } = useAuth();
    const joinPool = useJoinPool(props.pool);
    const { format: formatNum } = useNumbers();

    const {
      requiredAllowances,
      approveAllowances,
      approving,
      approvedAll
    } = useTokenApprovals(
      store.getters.getTokens(),
      props.pool.tokens,
      amounts
    );

    // COMPUTED
    const tokenWeights = computed(() => props.pool.weightsPercent);
    const allTokens = computed(() => store.getters.getTokens());
    const isStablePool = computed(
      () => props.pool.strategy.name === 'stablePool'
    );

    const hasAmounts = computed(() => {
      const amountSum = amounts.value
        .map(amount => parseFloat(amount))
        .reduce((a, b) => a + b, 0);
      return amountSum > 0;
    });

    const hasBalance = computed(() => {
      const balanceSum = props.pool.tokens
        .map(token => allTokens.value[token].balance)
        .reduce((a, b) => a + b, 0);
      return balanceSum > 0;
    });

    const total = computed(() => {
      const total = props.pool.tokens
        .map((token, i) => {
          return (
            (Number(amounts.value[i]) || 0) *
              store.state.market.prices[token]?.price || 0
          );
        })
        .reduce((a, b) => a + b, 0);

      return formatNum(total, '$0,0.[00]');
    });

    const requireApproval = computed(() => {
      if (!hasAmounts.value) return false;
      if (!hasBalance.value) return false;
      if (approvedAll.value) return false;
      return Object.keys(requiredAllowances.value).length > 0;
    });

    const poolAdapter = new PoolAdapter(
      allTokens.value,
      props.pool.tokens,
      [props.pool.address],
      props.pool.tokenBalances,
      [props.pool.totalSupply]
    );

    // METHODS
    function tokenBalance(index) {
      return allTokens.value[props.pool.tokens[index]].balance;
    }

    function infoLabel(index) {
      return isAuthenticated.value
        ? `${formatNum(tokenBalance(index), '0,0.[000]')} max`
        : '';
    }

    function amountRules(index) {
      return isAuthenticated.value
        ? [
            isPositive(),
            isLessThanOrEqualTo(tokenBalance(index), 'Exceeds balance')
          ]
        : [isPositive()];
    }

    function connectWallet() {
      store.commit('setAccountModal', true);
    }

    function onInput(amount, index, type = 'send'): void {
      const { sendAmounts, receiveAmounts } = poolAdapter.calcAmountsWith(
        type,
        index,
        amount
      );
      amounts.value = sendAmounts;
      receiveAmount.value = receiveAmounts[0];
    }

    function resetForm() {
      amounts.value = [];
      receiveAmount.value = '';
    }

    function txListener(hash) {
      const { emitter } = notify.hash(hash);

      emitter.on('txConfirmed', tx => {
        emit('success', tx);
        resetForm();
        loading.value = false;
        return undefined;
      });

      emitter.on('txCancel', () => {
        // A new transaction has been submitted with the same nonce, a higher gas price, a value of zero and sent to an external address (not a contract)
        loading.value = false;
        return undefined;
      });

      emitter.on('txFailed', () => {
        // An error has occurred initiating the transaction
        loading.value = false;
        return undefined;
      });
    }

    async function submit(): Promise<void> {
      if (!investForm.value.validate()) return;
      try {
        loading.value = true;
        const tx = await joinPool(amounts.value, receiveAmount.value);
        console.log('Receipt', tx);
        txListener(tx.hash);
      } catch (error) {
        console.error(error);
        loading.value = false;
      }
    }

    return {
      investForm,
      amounts,
      receiveAmount,
      submit,
      allTokens,
      hasAmounts,
      loading,
      approving,
      onInput,
      requireApproval,
      approveAllowances,
      tokenWeights,
      tokenBalance,
      amountRules,
      total,
      formatNum,
      isStablePool,
      isAuthenticated,
      connectWallet,
      infoLabel
    };
  }
});
</script>
