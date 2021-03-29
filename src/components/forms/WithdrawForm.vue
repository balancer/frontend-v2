<template>
  <BalForm ref="withdrawForm" @on-submit="submit">
    <div class="flex flex-wrap items-end w-full mb-6">
      <div class="w-full xl:w-1/2">
        <BalSelectInput
          name="withdrawType"
          label="Withdrawal type"
          v-model="withdrawType"
          :options="['Proportional', 'Single asset']"
          @change="onWithdrawTypeChange"
          no-margin
        />
      </div>
      <div v-if="isProportional" class="ml-0 mt-4 xl:ml-4 xl:mt-0 flex-1">
        <BalRangeInput
          class="w-full"
          v-model="range"
          :max="1000"
          :interval="1"
          :min="0"
          :right-label="`${propPercentage}%`"
          tooltip="none"
          @drag="onRangeChange"
        />
      </div>
    </div>

    <BalTextInput
      v-for="(token, i) in pool.tokens"
      :key="i"
      :name="token"
      v-model="amounts[i]"
      :rules="[isPositive()]"
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
  computed,
  watch,
  onMounted,
  nextTick,
  reactive,
  toRefs
} from 'vue';
import { FormRef } from '@/types';
import { isPositive } from '@/utils/validations';
import { useStore } from 'vuex';
import useAuth from '@/composables/useAuth';
import useNumbers from '@/composables/useNumbers';
import useBlocknative from '@/composables/useBlocknative';
import PoolExchange from '@/services/pool/Exchange';
import PoolCalculator from '@/services/pool/Calculator';
import { bnum } from '@/utils';
import { formatUnits } from '@ethersproject/units';

export default defineComponent({
  name: 'WithdrawalForm',

  emits: ['success'],

  props: {
    pool: { type: Object, required: true }
  },

  setup(props, { emit }) {
    const data = reactive({
      withdrawForm: {} as FormRef,
      loading: false,
      amounts: [] as string[],
      propMax: [] as string[],
      singleAssetMax: [] as string[],
      bptIn: '',
      withdrawType: 'Proportional' as 'Proportional' | 'Single asset',
      singleAsset: 0,
      range: 1000
    });

    // COMPOSABLES
    const store = useStore();
    const notify = useBlocknative();
    const { isAuthenticated } = useAuth();
    const { format: formatNum } = useNumbers();

    // COMPUTED
    const tokenWeights = computed(() => props.pool.weightsPercent);
    const allTokens = computed(() => store.getters.getTokens());

    const fullAmounts = computed(() => {
      return props.pool.tokens.map((_, i) => {
        return data.amounts[i] || '0';
      });
    });

    const hasAmounts = computed(() => {
      const amountSum = fullAmounts.value
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
            (parseFloat(fullAmounts.value[i]) || 0) *
              store.state.market.prices[token.toLowerCase()]?.price || 0
          );
        })
        .reduce((a, b) => a + b, 0);

      if (total < 0) return formatNum(0, '$0,0.[00]');
      return formatNum(total, '$0,0.[00]');
    });

    const propPercentage = computed(() => {
      const maxAmount = Number(bptBalance.value);
      const currentAmount = Number(data.bptIn);
      if (!currentAmount) return 0;
      if (maxAmount === 0) return 0;
      return Math.ceil((currentAmount / maxAmount) * 100);
    });

    const isProportional = computed(() => {
      return data.withdrawType === 'Proportional';
    });

    const isSingleAsset = computed(() => {
      return data.withdrawType === 'Single asset';
    });

    const poolExchange = new PoolExchange(
      props.pool,
      store.state.web3.config.key,
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
      const { send, receive } = poolCalculator.propAmountsGiven(
        bptBalance.value,
        0,
        'send'
      );
      data.bptIn = send[0];
      data.amounts = receive;
      data.propMax = [...receive];
      data.range = 1000;
    }

    function onRangeChange(range) {
      const fractionBasisPoints = (range / 1000) * 10000;
      const bpt = bnum(bptBalance.value)
        .times(fractionBasisPoints)
        .div(10000);
      const { send, receive } = poolCalculator.propAmountsGiven(
        bpt.toString(),
        0,
        'send'
      );
      data.bptIn = send[0];
      data.amounts = receive;
    }

    function setSingleAsset(index) {
      if (!isSingleAsset.value) return;
      props.pool.tokens.forEach((_, i) => {
        if (i === index) {
          data.amounts[i] = data.singleAssetMax[index];
        } else {
          data.amounts[i] = '0';
        }
      });
      data.singleAsset = index;
    }

    async function onWithdrawTypeChange(newType) {
      nextTick(async () => {
        if (newType === 'Proportional') setPropMax();
        if (newType === 'Single asset') {
          await calcSingleAssetMax();
          setSingleAsset(0);
        }
      });
    }

    async function calcSingleAssetMax() {
      data.singleAssetMax = [];
      for (let i = 0; i < props.pool.tokens.length; i++) {
        const { amountsOut } = await poolExchange.queryExit(
          store.state.web3.account,
          fullAmounts.value,
          bptBalance.value,
          i
        );
        data.singleAssetMax[i] = formatUnits(
          amountsOut[i],
          allTokens.value[props.pool.tokens[i]].decimals
        );
      }
    }

    function txListener(hash) {
      const { emitter } = notify.hash(hash);

      emitter.on('txConfirmed', tx => {
        emit('success', tx);
        data.amounts = [];
        data.loading = false;
        return undefined;
      });

      emitter.on('txCancel', () => {
        // A new transaction has been submitted with the same nonce, a higher gas price, a value of zero and sent to an external address (not a contract)
        data.loading = false;
        return undefined;
      });

      emitter.on('txFailed', () => {
        // An error has occurred initiating the transaction
        data.loading = false;
        return undefined;
      });
    }

    async function submit(): Promise<void> {
      if (!data.withdrawForm.validate()) return;
      try {
        data.loading = true;
        const exitTokenIndex = isSingleAsset.value ? data.singleAsset : null;
        const tx = await poolExchange.exit(
          store.state.web3.account,
          fullAmounts.value,
          bptBalance.value,
          exitTokenIndex
        );
        console.log('Receipt', tx);
        txListener(tx.hash);
      } catch (error) {
        console.error(error);
        data.loading = false;
      }
    }

    watch(bptBalance, () => setPropMax());

    onMounted(() => {
      if (bptBalance.value) setPropMax();
    });

    return {
      ...toRefs(data),
      submit,
      allTokens,
      hasAmounts,
      tokenWeights,
      isPositive,
      formatNum,
      isAuthenticated,
      connectWallet,
      bptBalance,
      bptInfoLabel,
      setPropMax,
      total,
      tokenBalance,
      onRangeChange,
      onWithdrawTypeChange,
      isProportional,
      isSingleAsset,
      setSingleAsset,
      propPercentage
    };
  }
});
</script>
