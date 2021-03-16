<template>
  <BalForm ref="withdrawForm" @on-submit="submit">
    <BalTextInput
      name="total"
      v-model="amountIn"
      :rules="[isPositive(), isLessThanOrEqualTo(bptBalance)]"
      validate-on="input"
      placeholder="0"
      type="number"
      min="0"
      :max="bptBalance"
      step="any"
      :info="`${bptBalance} max`"
      @input="onInput($event)"
    >
      <template v-slot:prepend>
        <div class="w-24 flex flex-col">
          <div class="font-medium text-sm leading-none">
            Pool shares
          </div>
          <div class="leading-none text-xs mt-1 text-gray-500">
            BPT
          </div>
        </div>
      </template>
    </BalTextInput>

    <hr class="mb-4"/>

    <BalTextInput
      v-for="(token, i) in pool.tokens"
      :key="i"
      :name="token"
      v-model="receiveAmounts[i]"
      :rules="[isPositive()]"
      type="number"
      min="0"
      :max="receiveAmountsMax[i]"
      step="any"
      placeholder="0"
      :info="`${formatNum(receiveAmountsMax[i], '0,0.[000]')} max`"
      :disabled="true"
      validate-on="input"
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

    <BalBtn
      v-if="requireApproval"
      label="Allow"
      :loading="approving"
      loading-label="Allowing..."
      :disabled="!hasAmounts"
      block
      @click.stop="approveAllowances"
    />
    <BalBtn
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
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { isPositive, isLessThanOrEqualTo } from '@/utils/validations';
import { FormRef } from '@/types';
import PoolAdapter from '@/utils/balancer/adapters/pool';
import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import useExitPool from '@/composables/pools/useExitPool';
import useNumbers from '@/composables/useNumbers';

export default defineComponent({
  name: 'InvestForm',

  props: {
    pool: { type: Object, required: true }
  },

  setup(props, { emit }) {
    const withdrawForm = ref({} as FormRef);
    const loading = ref(false);
    const amountIn = ref('');
    const receiveAmounts = ref([] as string[]);
    const receiveAmountsMax = ref([] as string[]);

    // COMPOSABLES
    const store = useStore();
    const exitPool = useExitPool(props.pool);
    const { format: formatNum } = useNumbers();

    const {
      requiredAllowances,
      approveAllowances,
      approving,
      approvedAll
    } = useTokenApprovals(
      store.getters.getTokens(),
      props.pool.tokens,
      receiveAmounts
    );

    // COMPUTED
    const tokenWeights = computed(() => props.pool.strategy.weightsPercent);
    const allTokens = computed(() => store.getters.getTokens());

    const hasAmounts = computed(() => {
      const amountSum = receiveAmounts.value
        .map(amount => parseFloat(amount))
        .reduce((a, b) => a + b, 0);
      return amountSum > 0;
    });

    const requireApproval = computed(() => {
      if (!hasAmounts.value) return false;
      if (approvedAll.value) return false;
      return Object.keys(requiredAllowances.value).length > 0;
    });

    const bptBalance = computed(() => {
      console.log(allTokens.value[props.pool.address].balance);
      return allTokens.value[props.pool.address].balance;
    });

    const poolAdapter = new PoolAdapter(
      allTokens.value,
      [props.pool.address],
      props.pool.tokens,
      [props.pool.totalSupply],
      props.pool.tokenBalances
    );

    // METHODS
    function tokenBalance(index) {
      return allTokens.value[props.pool.tokens[index]].balance;
    }

    function onInput(amount): void {
      const {
        sendAmounts,
        receiveAmounts: _receiveAmounts
      } = poolAdapter.calcAmountsWith('send', 0, amount);
      amountIn.value = sendAmounts[0];
      receiveAmounts.value = _receiveAmounts;
    }

    function resetForm() {
      amountIn.value = '';
      receiveAmounts.value = [];
    }

    async function submit(): Promise<void> {
      if (!withdrawForm.value.validate()) return;
      try {
        loading.value = true;
        const tx = await exitPool(amountIn.value, receiveAmounts.value);
        const receipt = await tx.wait();
        console.log('Receipt', receipt);
        emit('onTx', receipt);
        resetForm();
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    }

    onMounted(() => {
      amountIn.value = bptBalance.value;
      onInput(amountIn.value);
      receiveAmountsMax.value = receiveAmounts.value;
    });

    return {
      withdrawForm,
      amountIn,
      receiveAmounts,
      submit,
      onInput,
      allTokens,
      hasAmounts,
      loading,
      approving,
      requireApproval,
      approveAllowances,
      tokenWeights,
      tokenBalance,
      isPositive,
      isLessThanOrEqualTo,
      formatNum,
      bptBalance,
      receiveAmountsMax
    };
  }
});
</script>
