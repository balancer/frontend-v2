<template>
  <BalForm ref="investForm" @on-submit="submit">
    <div class="flex items-center w-full">
      <div class="w-1/2">
        <BalSelectInput
          name="investType"
          label="Investment type"
          v-model="investType"
          :options="['Proportional', 'Custom']"
          @change="onInvestTypeChange"
        />
      </div>
      <div v-if="isProportional" class="ml-4 flex-1">
        <div class="text-right text-sm text-gray-500">
          {{ propPercentage }}%
        </div>
        <input
          type="range"
          v-model="amounts[pool.tokens.indexOf(propToken)]"
          :max="tokenBalance(pool.tokens.indexOf(propToken))"
          step="0.001"
          @update:modelValue="onPropChange"
          class="w-full"
        />
      </div>
    </div>

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
      :disabled="loading || isProportional"
      validate-on="input"
      prepend-border
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
      <template v-if="!isProportional" v-slot:info>
        <div class="cursor-pointer" @click="amounts[i] = tokenBalance(i)">
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
      prepend-border
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
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { FormRef } from '@/types';
import { isPositive, isLessThanOrEqualTo } from '@/utils/validations';
import { useStore } from 'vuex';
import useAuth from '@/composables/useAuth';
import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import useNumbers from '@/composables/useNumbers';
import useBlocknative from '@/composables/useBlocknative';
import PoolExchange from '@/services/pool/Exchange';
import PoolCalculator from '@/services/pool/Calculator';

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
    const propToken = ref('');
    const investType = ref('Proportional');

    // COMPOSABLES
    const store = useStore();
    const notify = useBlocknative();
    const { web3, isAuthenticated } = useAuth();
    const { format: formatNum } = useNumbers();

    const {
      requiredAllowances,
      approveAllowances,
      approving,
      approvedAll
    } = useTokenApprovals(props.pool.tokens, amounts);

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
        .map(token => Number(allTokens.value[token].balance))
        .reduce((a, b) => a + b, 0);
      return balanceSum > 0;
    });

    const total = computed(() => {
      const total = props.pool.tokens
        .map((token, i) => {
          return (
            (Number(amounts.value[i]) || 0) *
              store.state.market.prices[token.toLowerCase()]?.price || 0
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

    const isProportional = computed(() => {
      return investType.value === 'Proportional';
    });

    const propPercentage = computed(() => {
      const currentAmount =
        amounts.value[props.pool.tokens.indexOf(propToken.value)];
      const maxAmount = tokenBalance(
        props.pool.tokens.indexOf(propToken.value)
      );

      if (!currentAmount) return 0;
      return Math.ceil((Number(currentAmount) / maxAmount) * 100);
    });

    const poolExchange = new PoolExchange(
      props.pool,
      store.state.web3.config.key,
      web3,
      allTokens.value
    );

    const poolCalculator = new PoolCalculator(
      props.pool,
      allTokens.value,
      'join'
    );

    // METHODS
    function tokenBalance(index) {
      return allTokens.value[props.pool.tokens[index]]?.balance || 0;
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

    function setPropMax() {
      const { send, receive, fixedToken } = poolCalculator.propMax();
      amounts.value = send;
      receiveAmount.value = receive[0];
      propToken.value = fixedToken;
    }

    function onPropChange() {
      const propTokenIndex = props.pool.tokens.indexOf(propToken.value);
      const amount = amounts.value[propTokenIndex];
      const { send, receive } = poolCalculator.propAmountsGiven(
        amount,
        propTokenIndex,
        'send'
      );
      amounts.value = send;
      receiveAmount.value = receive[0];
    }

    function onInvestTypeChange(newType) {
      if (newType === 'Proportional') setPropMax();
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
        const tx = await poolExchange.join(
          store.state.web3.account,
          amounts.value
        );
        console.log('Receipt', tx);
        txListener(tx.hash);
      } catch (error) {
        console.error(error);
        loading.value = false;
      }
    }

    watch(allTokens, newTokens => {
      poolCalculator.setAllTokens(newTokens);
      if (!hasAmounts.value) setPropMax();
    });

    onMounted(() => {
      setPropMax();
    });

    return {
      investForm,
      amounts,
      receiveAmount,
      submit,
      allTokens,
      hasAmounts,
      loading,
      approving,
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
      infoLabel,
      setPropMax,
      propToken,
      investType,
      onPropChange,
      isProportional,
      onInvestTypeChange,
      propPercentage
    };
  }
});
</script>
