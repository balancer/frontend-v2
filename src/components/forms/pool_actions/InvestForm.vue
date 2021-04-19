<template>
  <BalForm ref="investForm" @on-submit="submit">
    <FormTypeToggle
      v-model="investType"
      :form-types="formTypes"
      :hasZeroBalance="hasZeroBalance"
      :loading="loading"
    />

    <template v-if="isProportional">
      <div class="p-4 border-t">
        <div class="border rounded-lg shadow-inner p-2">
          <div
            class="flex items-center justify-between mb-3 text-sm text-gray-600"
          >
            <span v-text="$t('amountToInvest')" />
            <span>{{ propPercentage }}%</span>
          </div>
          <div class="flex items-end">
            <span
              class="mr-2 text-lg font-medium w-1/2 break-words leading-none"
              :title="total"
            >
              {{ total }}
            </span>
            <BalRangeInput
              class="w-1/2"
              v-model="range"
              :max="1000"
              :interval="1"
              :min="0"
              tooltip="none"
              :disabled="loading"
            />
          </div>
        </div>
      </div>

      <div class="px-4 py-3 bg-gray-50 border-t border-b">
        <div
          v-for="(token, i) in pool.tokens"
          :key="token"
          class="py-3 last:mb-0"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center w-1/2">
              <Token :token="allTokens[token]" class="mr-2" />
              <div class="flex flex-col w-3/4 leading-none">
                <span
                  class="break-words"
                  :title="
                    `${fNum(amounts[i], 'token')} ${allTokens[token].symbol}`
                  "
                >
                  {{ fNum(amounts[i], 'token') }} {{ allTokens[token].symbol }}
                </span>
                <span
                  class="text-xs text-gray-400 break-words"
                  :title="`${balanceLabel(i)} balance`"
                >
                  {{ balanceLabel(i) }} {{ $t('balance').toLowerCase() }}
                </span>
              </div>
            </div>
            <div class="flex flex-col w-1/2 leading-none text-right pl-2">
              <span class="break-words" :title="fNum(amountUSD(i), 'usd')">
                {{ fNum(amountUSD(i), 'usd') }}
              </span>
              <span class="text-xs text-gray-400">
                {{ fNum(tokenWeights[i]) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="px-4 pt-6 bg-gray-50 border-t border-b">
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
                {{ fNum(tokenWeights[i]) }}%
              </span>
            </div>
          </div>
        </template>
        <template v-slot:info>
          <div class="cursor-pointer" @click="amounts[i] = tokenBalance(i)">
            {{ balanceLabel(i) }} {{ $t('max').toLowerCase() }}
          </div>
        </template>
      </BalTextInput>
    </div>

    <div class="p-4">
      <BalBtn
        v-if="!isAuthenticated"
        :label="$t('connectWallet')"
        block
        @click.prevent="connectWallet"
      />
      <template v-else>
        <div :class="['flex items-center text-sm mb-4', priceImpactClasses]">
          <span
            >{{ $t('priceImpact') }}: {{ fNum(priceImpact, 'percent') }}</span
          >
          <BalIcon
            v-if="priceImpact >= 0.01"
            name="alert-triangle"
            size="xs"
            class="ml-1"
          />
          <BalTooltip v-if="priceImpact < 0.0">
            <template v-slot:activator>
              <BalIcon
                name="info"
                size="xs"
                class="text-gray-400 -mb-px ml-2"
              />
            </template>
            <div v-html="$t('customAmountsTip')" class="w-52" />
          </BalTooltip>
        </div>
        <BalBtn
          v-if="requireApproval"
          :label="$t('allow')"
          :loading="approving"
          :loading-label="$t('allowing')"
          :disabled="!hasAmounts"
          block
          @click.prevent="approveAllowances"
        />
        <template v-else>
          <BalCheckboxInput
            v-if="priceImpact >= 0.01"
            v-model="highPiAccepted"
            :rules="[isRequired()]"
            name="highPiAccepted"
            class="text-gray-500 mb-8"
            size="sm"
            :label="$t('priceImpactAccept')"
          />
          <BalBtn
            type="submit"
            loading-label="Confirming..."
            color="gradient"
            :disabled="!hasAmounts"
            :loading="loading"
            block
          >
            {{ $t('invest') }} {{ total.length > 15 ? '' : total }}
          </BalBtn>
        </template>
      </template>
    </div>
  </BalForm>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  watch,
  onMounted,
  reactive,
  toRefs,
  ref
} from 'vue';
import { FormRef } from '@/types';
import {
  isPositive,
  isLessThanOrEqualTo,
  isRequired
} from '@/utils/validations';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { TransactionData } from 'bnc-notify';

import useAuth from '@/composables/useAuth';
import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import useNumbers from '@/composables/useNumbers';
import useNotify from '@/composables/useNotify';

import PoolExchange from '@/services/pool/exchange';
import PoolCalculator from '@/services/pool/calculator';
import { formatUnits } from '@ethersproject/units';
import { bnum } from '@/utils';
import FormTypeToggle from './shared/FormTypeToggle.vue';

export enum FormTypes {
  proportional = 'proportional',
  custom = 'custom'
}

export default defineComponent({
  name: 'InvestForm',

  components: {
    FormTypeToggle
  },

  emits: ['success'],

  props: {
    pool: { type: Object, required: true }
  },

  setup(props, { emit }) {
    const data = reactive({
      investForm: {} as FormRef,
      investType: FormTypes.proportional as FormTypes,
      loading: false,
      amounts: [] as string[],
      propMax: [] as string[],
      propToken: 0,
      range: 1000,
      highPiAccepted: false
    });

    // COMPOSABLES
    const store = useStore();
    const { isAuthenticated } = useAuth();
    const { fNum, toFiat } = useNumbers();
    const { t } = useI18n();
    const { txListener } = useNotify();

    const fullAmountsMap = computed(() => {
      const oos = props.pool.tokens.reduce(
        (amounts, token, i) => ({
          ...amounts,
          [token]: data.amounts[i] || '0'
        }),
        {}
      );
      return oos;
    });

    const {
      requiredAllowances,
      approveAllowances,
      approving,
      approvedAll
    } = useTokenApprovals(props.pool.tokens, data.amounts, fullAmountsMap);

    // SERVICES
    const poolExchange = new PoolExchange(
      props.pool,
      store.state.web3.config.key,
      store.getters['registry/getTokens']()
    );

    const poolCalculator = new PoolCalculator(
      props.pool,
      store.getters['registry/getTokens'](),
      'join'
    );

    // COMPUTED
    const tokenWeights = computed(() => props.pool.weightsPercent);
    const allTokens = computed(() => store.getters['registry/getTokens']());

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
      return balances.value.map(b => Number(b)).includes(0);
    });

    const total = computed(() => {
      const total = props.pool.tokens
        .map((_, i) => amountUSD(i))
        .reduce((a, b) => a + b, 0);

      if (total < 0) return fNum(0, 'usd');
      return fNum(total, 'usd');
    });

    const requireApproval = computed(() => {
      if (!hasAmounts.value) return false;
      if (!hasBalance.value) return false;
      if (approvedAll.value) return false;
      return Object.keys(requiredAllowances.value).length > 0;
    });

    const isProportional = computed(() => {
      return data.investType === FormTypes.proportional;
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

    const propMaxUSD = computed(() => {
      const total = props.pool.tokens
        .map((token, i) => toFiat(Number(data.propMax[i]), token))
        .reduce((a, b) => a + b, 0);

      return fNum(total, 'usd');
    });

    const balanceMaxUSD = computed(() => {
      const total = props.pool.tokens
        .map((token, i) => toFiat(balances.value[i], token))
        .reduce((a, b) => a + b, 0);

      return fNum(total, 'usd');
    });

    const priceImpact = computed(() => {
      if (isProportional.value || !hasAmounts.value) return 0;
      return poolCalculator.priceImpact(fullAmounts.value).toNumber();
    });

    const priceImpactClasses = computed(() => {
      return {
        'text-red-500 font-medium': priceImpact.value >= 0.01,
        'text-gray-500 font-normal': priceImpact.value < 0.01
      };
    });

    const formTypes = ref([
      {
        label: t('noPriceImpact'),
        max: propMaxUSD,
        value: FormTypes.proportional,
        tooltip: t('noPriceImpactTip')
      },
      {
        label: t('customAmounts'),
        max: balanceMaxUSD,
        value: FormTypes.custom,
        tooltip: t('customAmountsTip')
      }
    ]);

    // METHODS
    function tokenBalance(index) {
      return allTokens.value[props.pool.tokens[index]]?.balance || 0;
    }

    function amountUSD(index) {
      const amount = fullAmounts.value[index] || 0;
      const token = props.pool.tokens[index].toLowerCase();
      return toFiat(amount, token);
    }

    function balanceLabel(index) {
      return fNum(tokenBalance(index), 'token');
    }

    function amountRules(index) {
      return isAuthenticated.value
        ? [
            isPositive(),
            isLessThanOrEqualTo(tokenBalance(index), t('exceedsBalance'))
          ]
        : [isPositive()];
    }

    function connectWallet() {
      store.commit('web3/setAccountModal', true);
    }

    async function setPropMax() {
      const { send, fixedToken } = poolCalculator.propMax();
      data.amounts = send;
      data.propMax = [...send];
      data.propToken = fixedToken;
      data.range = 1000;
    }

    async function calcMinBptOut(): Promise<string> {
      const { bptOut } = await poolExchange.queryJoin(
        store.state.web3.account,
        fullAmounts.value
      );
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
        txListener(tx.hash, {
          onTxConfirmed: (tx: TransactionData) => {
            emit('success', tx);
            data.amounts = [];
            data.loading = false;
          },
          onTxCancel: () => {
            data.loading = false;
          },
          onTxFailed: () => {
            data.loading = false;
          }
        });
      } catch (error) {
        console.error(error);
        data.loading = false;
      }
    }

    watch(allTokens, newTokens => {
      poolCalculator.setAllTokens(newTokens);
      if (!hasAmounts.value) setPropMax();
      if (hasZeroBalance.value) data.investType = FormTypes.custom;
    });

    watch(
      () => data.investType,
      newType => {
        if (newType === FormTypes.proportional) setPropMax();
      }
    );

    watch(
      () => data.range,
      newVal => {
        const fractionBasisPoints = (newVal / 1000) * 10000;
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
    );

    watch(isAuthenticated, isAuth => {
      if (!isAuth) {
        data.amounts = [];
        data.propMax = [];
      }
    });

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
      fNum,
      isAuthenticated,
      connectWallet,
      balanceLabel,
      isProportional,
      propPercentage,
      priceImpact,
      priceImpactClasses,
      amountUSD,
      formTypes,
      isRequired,
      hasZeroBalance
    };
  }
});
</script>
