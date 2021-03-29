<template>
  <BalForm ref="investForm" @on-submit="submit">
    <div class="flex items-center w-full">
      <div class="w-1/2">
        <BalSelectInput
          name="investType"
          label="Investment type"
          v-model="investType"
          :options="['Proportional', 'Custom']"
        />
      </div>
      <div v-if="isProportional" class="ml-4 flex-1">
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
      :disabled="true"
      prepend-border
    >
      <template v-slot:prepend>
        <div class="w-24 flex flex-col">
          <div class="font-medium text-sm leading-none">
            Total
          </div>
          <div :class="['leading-none text-xs mt-1', priceImpactClasses]">
            Price impact
          </div>
        </div>
      </template>
      <template v-slot:info>
        <div :class="['flex items-center', priceImpactClasses]">
          <span>{{ formatNum(priceImpact, '0.00%') }}</span>
          <BalIcon
            v-if="priceImpact >= 0.01"
            name="alert-triangle"
            size="xs"
            class="ml-1"
          />
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
import {
  defineComponent,
  computed,
  watch,
  onMounted,
  reactive,
  toRefs
} from 'vue';
import { FormRef } from '@/types';
import { isPositive, isLessThanOrEqualTo } from '@/utils/validations';
import { useStore } from 'vuex';
import useAuth from '@/composables/useAuth';
import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import useNumbers from '@/composables/useNumbers';
import useBlocknative from '@/composables/useBlocknative';
import PoolExchange from '@/services/pool/Exchange';
import PoolCalculator from '@/services/pool/Calculator';
import { formatUnits } from '@ethersproject/units';
import { bnum } from '@/utils';

export default defineComponent({
  name: 'InvestForm',

  emits: ['success'],

  props: {
    pool: { type: Object, required: true }
  },

  setup(props, { emit }) {
    const data = reactive({
      investForm: {} as FormRef,
      loading: false,
      amounts: [] as string[],
      propToken: 0,
      investType: 'Proportional' as 'Proportional' | 'Custom',
      range: 1000
    });

    // COMPOSABLES
    const store = useStore();
    const notify = useBlocknative();
    const { isAuthenticated } = useAuth();
    const { format: formatNum } = useNumbers();

    const {
      requiredAllowances,
      approveAllowances,
      approving,
      approvedAll
    } = useTokenApprovals(props.pool.tokens, data.amounts);

    const poolExchange = new PoolExchange(
      props.pool,
      store.state.web3.config.key,
      store.getters.getTokens()
    );

    const poolCalculator = new PoolCalculator(
      props.pool,
      store.getters.getTokens(),
      'join'
    );

    // COMPUTED
    const tokenWeights = computed(() => props.pool.weightsPercent);
    const allTokens = computed(() => store.getters.getTokens());

    const hasAmounts = computed(() => {
      const amountSum = fullAmounts.value
        .map(amount => parseFloat(amount))
        .reduce((a, b) => a + b, 0);
      return amountSum > 0;
    });

    const balances = computed(() => {
      return props.pool.tokens.map(token => allTokens.value[token].balance);
    });

    const hasBalance = computed(() => {
      const balanceSum = balances.value
        .map(b => Number(b))
        .reduce((a, b) => a + b, 0);
      return balanceSum > 0;
    });

    const hasZeroBalance = computed(() => {
      return balances.value.includes('0');
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

    const requireApproval = computed(() => {
      if (!hasAmounts.value) return false;
      if (!hasBalance.value) return false;
      if (approvedAll.value) return false;
      return Object.keys(requiredAllowances.value).length > 0;
    });

    const isProportional = computed(() => {
      return data.investType === 'Proportional';
    });

    const propPercentage = computed(() => {
      const currentAmount = fullAmounts.value[data.propToken];
      const maxAmount = tokenBalance(data.propToken);

      if (currentAmount === '0') return 0;
      return Math.ceil((Number(currentAmount) / maxAmount) * 100);
    });

    const fullAmounts = computed(() => {
      return props.pool.tokens.map((_, i) => {
        return data.amounts[i] || '0';
      });
    });

    const priceImpact = computed(() => {
      if (!hasAmounts.value) return 0;
      return poolCalculator.priceImpact(fullAmounts.value).toNumber();
    });

    const priceImpactClasses = computed(() => {
      return {
        'text-red-500 font-medium': priceImpact.value >= 0.01,
        'text-gray-500 font-normal': priceImpact.value < 0.01
      };
    });

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

    async function setPropMax() {
      const { send, fixedToken } = poolCalculator.propMax();
      data.amounts = send;
      data.propToken = fixedToken;
      data.range = 1000;
    }

    function onRangeChange(range) {
      const fractionBasisPoints = (range / 1000) * 10000;
      const amount = bnum(balances.value[data.propToken])
        .times(fractionBasisPoints)
        .div(10000);
      const { send } = poolCalculator.propAmountsGiven(
        amount.toString(),
        data.propToken,
        'send'
      );
      data.amounts = send;
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

    async function calcMinBptOut(): Promise<string> {
      const { bptOut } = await poolExchange.queryJoin(
        store.state.web3.account,
        fullAmounts.value
      );
      console.log('queryJoin BPT', bptOut.toString())
      const slippageBasisPoints = parseFloat(store.state.app.slippage) * 10000;
      const delta = bptOut.mul(slippageBasisPoints).div(10000);
      const minBptOut = bptOut.sub(delta);
      return formatUnits(
        minBptOut,
        allTokens.value[props.pool.address].decimals
      );
    }

    async function submit(): Promise<void> {
      if (!data.investForm.validate()) return;
      try {
        data.loading = true;
        const minBptOut = await calcMinBptOut();
        const tx = await poolExchange.join(
          store.state.web3.account,
          fullAmounts.value,
          minBptOut
        );
        console.log('Receipt', tx);
        txListener(tx.hash);
      } catch (error) {
        console.error(error);
        data.loading = false;
      }
    }

    watch(allTokens, newTokens => {
      poolCalculator.setAllTokens(newTokens);
      if (!hasAmounts.value) setPropMax();
      if (hasZeroBalance.value) {
        data.investType = 'Custom';
      } else {
        data.investType = 'Proportional';
      }
    });

    watch(
      () => data.investType,
      newType => {
        if (newType === 'Proportional') setPropMax();
      }
    );

    onMounted(() => {
      setPropMax();
    });

    return {
      ...toRefs(data),
      submit,
      allTokens,
      hasAmounts,
      approving,
      requireApproval,
      approveAllowances,
      tokenWeights,
      tokenBalance,
      amountRules,
      total,
      formatNum,
      isAuthenticated,
      connectWallet,
      infoLabel,
      setPropMax,
      onRangeChange,
      isProportional,
      propPercentage,
      priceImpact,
      priceImpactClasses
    };
  }
});
</script>
