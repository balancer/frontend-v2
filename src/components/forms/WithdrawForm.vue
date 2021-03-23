<template>
  <BalForm ref="withdrawForm" @on-submit="submit">
    <div class="flex items-center w-full">
      <div class="w-1/2">
        <BalSelectInput
          name="withdrawType"
          label="Withdrawal type"
          v-model="withdrawType"
          :options="['Proportional', 'Single asset']"
          @change="onWithdrawTypeChange"
        />
      </div>
      <div v-if="isProportional" class="ml-4 flex-1">
        <div class="text-right text-sm text-gray-500">
          {{ propPercentage }}%
        </div>
        <input
          type="range"
          v-model="bptIn"
          :max="bptBalance"
          step="0.001"
          @update:modelValue="onPropChange"
          class="w-full"
        />
      </div>
    </div>

    <BalTextInput
      v-for="(token, i) in pool.tokens"
      :key="i"
      :name="token"
      v-model="amounts[i]"
      :rules="amountRules(amountsMax[i])"
      type="number"
      min="0"
      step="any"
      placeholder="0"
      validate-on="input"
      prepend-border
      :disabled="isProportional || isSingleAsset"
      :faded-out="isSingleAsset && singleAsset !== i"
      @click="setSingleAsset(i)"
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
    </BalTextInput>

    <BalTextInput
      name="total"
      ref="bptInput"
      v-model="total"
      validate-on="input"
      placeholder="$0.00"
      disabled
      prepend-border
    >
      <template v-slot:prepend>
        <div class="w-24 flex flex-col">
          <div class="font-medium text-sm leading-none">
            Total
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
    <BalBtn
      v-else
      type="submit"
      label="Withdraw"
      loading-label="Confirming..."
      color="gradient"
      :disabled="!hasAmounts"
      :loading="loading"
      block
    />
  </BalForm>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  nextTick
} from 'vue';
import { FormRef } from '@/types';
import { isPositive, isLessThanOrEqualTo } from '@/utils/validations';
import { useStore } from 'vuex';
import useAuth from '@/composables/useAuth';
import useNumbers from '@/composables/useNumbers';
import useBlocknative from '@/composables/useBlocknative';
import PoolExchange from '@/services/pool/Exchange';
import PoolCalculator from '@/services/pool/Calculator';

export default defineComponent({
  name: 'WithdrawalForm',

  emits: ['success'],

  props: {
    pool: { type: Object, required: true }
  },

  setup(props, { emit }) {
    const withdrawForm = ref({} as FormRef);
    const loading = ref(false);
    const amounts = ref([] as string[]);
    const amountsMax = ref([] as string[]);
    const bptIn = ref('');
    const withdrawType = ref('Proportional');
    const propToken = ref('');
    const singleAsset = ref(0);

    // COMPOSABLES
    const store = useStore();
    const notify = useBlocknative();
    const { web3, isAuthenticated } = useAuth();
    const { format: formatNum } = useNumbers();

    // COMPUTED
    const tokenWeights = computed(() => props.pool.weightsPercent);
    const allTokens = computed(() => store.getters.getTokens());

    const hasAmounts = computed(() => {
      const amountSum = amounts.value
        .map(amount => parseFloat(amount))
        .reduce((a, b) => a + b, 0);
      return amountSum > 0;
    });

    const bptBalance = computed(() => {
      return allTokens.value[props.pool.address].balance;
    });

    const bptInfoLabel = computed(() => {
      return isAuthenticated.value ? `${bptBalance.value} max` : '';
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

    const propPercentage = computed(() => {
      const maxAmount = Number(bptBalance.value);
      const currentAmount = Number(bptIn.value);
      if (!currentAmount) return 0;
      if (maxAmount === 0) return 0;
      return Math.ceil((currentAmount / maxAmount) * 100);
    });

    const isProportional = computed(() => {
      return withdrawType.value === 'Proportional';
    });

    const isSingleAsset = computed(() => {
      return withdrawType.value === 'Single asset';
    });

    function amountRules(balance) {
      return isAuthenticated.value
        ? [isPositive(), isLessThanOrEqualTo(balance, 'Exceeds balance')]
        : [isPositive()];
    }

    const poolExchange = new PoolExchange(
      props.pool,
      store.state.web3.config.key,
      web3,
      allTokens.value
    );

    const poolCalculator = new PoolCalculator(
      props.pool,
      allTokens.value,
      'exit'
    );
    watch(allTokens, newTokens => poolCalculator.setAllTokens(newTokens));

    // METHODS
    function tokenBalance(index) {
      return allTokens.value[props.pool.tokens[index]]?.balance;
    }

    function connectWallet() {
      store.commit('setAccountModal', true);
    }

    function setPropMax() {
      const { send, receive, fixedToken } = poolCalculator.propAmountsGiven(
        bptBalance.value,
        0,
        'send'
      );
      bptIn.value = send[0];
      amounts.value = receive;
      amountsMax.value = [...receive];
      propToken.value = fixedToken;
    }

    function onPropChange() {
      const { send, receive } = poolCalculator.propAmountsGiven(
        bptIn.value,
        0,
        'send'
      );
      bptIn.value = send[0];
      amounts.value = receive;
    }

    function setSingleAsset(index) {
      if (!isSingleAsset.value) return;
      amounts.value.forEach((amount, i) => {
        if (i === index) {
          amounts.value[i] = amountsMax.value[index];
        } else {
          amounts.value[i] = '0';
        }
      });
      singleAsset.value = index;
    }

    function onWithdrawTypeChange(newType) {
      nextTick(() => {
        if (newType === 'Proportional') setPropMax();
        if (newType === 'Single asset') setSingleAsset(0);
      });
    }

    function resetForm() {
      amounts.value = [];
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
      if (!withdrawForm.value.validate()) return;
      try {
        loading.value = true;
        const exitTokenIndex = isSingleAsset.value ? singleAsset.value : null;
        const tx = await poolExchange.exit(
          store.state.web3.account,
          amounts.value,
          bptBalance.value,
          exitTokenIndex
        );
        console.log('Receipt', tx);
        txListener(tx.hash);
      } catch (error) {
        console.error(error);
        loading.value = false;
      }
    }

    watch(bptBalance, () => setPropMax());

    onMounted(() => {
      if (bptBalance.value) setPropMax();
    });

    return {
      withdrawForm,
      amounts,
      submit,
      allTokens,
      hasAmounts,
      loading,
      tokenWeights,
      amountRules,
      isPositive,
      formatNum,
      amountsMax,
      isAuthenticated,
      connectWallet,
      bptBalance,
      bptInfoLabel,
      setPropMax,
      total,
      withdrawType,
      tokenBalance,
      propToken,
      onPropChange,
      onWithdrawTypeChange,
      isProportional,
      isSingleAsset,
      singleAsset,
      setSingleAsset,
      bptIn,
      propPercentage
    };
  }
});
</script>
