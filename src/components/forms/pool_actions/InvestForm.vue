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
                  :title="`${formatBalance(i)} balance`"
                >
                  {{ $t('balance') }}: {{ formatBalance(i) }}
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
        v-model:isValid="validInputs[i]"
        :rules="amountRules(i)"
        type="number"
        min="0"
        step="any"
        placeholder="0"
        :disabled="loading"
        validate-on="input"
        prepend-border
        append-shadow
      >
        <template v-slot:prepend>
          <div class="flex items-center h-full w-24">
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
          <div
            class="cursor-pointer"
            @click.prevent="amounts[i] = tokenBalance(i)"
          >
            {{ $t('balance') }}: {{ formatBalance(i) }}
          </div>
        </template>
        <template v-slot:append>
          <div class="p-2">
            <BalBtn
              size="xs"
              color="white"
              @click.prevent="amounts[i] = tokenBalance(i)"
            >
              {{ $t('max') }}
            </BalBtn>
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
          <BalTooltip>
            <template v-slot:activator>
              <BalIcon
                v-if="priceImpact >= 0.01"
                name="alert-triangle"
                size="xs"
                class="ml-1"
              />
              <BalIcon
                v-else
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
          :label="$t('approveTokens')"
          :loading="approving"
          :loading-label="$t('approving')"
          :disabled="!hasAmounts || !hasValidInputs"
          block
          @click.prevent="approveAllowances"
        />
        <template v-else>
          <BalCheckbox
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
            :loading-label="$t('confirming')"
            color="gradient"
            :disabled="!hasAmounts || !hasValidInputs"
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
import { formatUnits } from '@ethersproject/units';

import useAuth from '@/composables/useAuth';
import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import useNumbers from '@/composables/useNumbers';
import useNotify from '@/composables/useNotify';
import useSlippage from '@/composables/useSlippage';
import useWeb3 from '@/composables/useWeb3';
import useTokens from '@/composables/useTokens';

import PoolExchange from '@/services/pool/exchange';
import PoolCalculator from '@/services/pool/calculator';
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
      validInputs: [] as boolean[],
      propToken: 0,
      range: 1000,
      highPiAccepted: false
    });

    // COMPOSABLES
    const store = useStore();
    const { isAuthenticated } = useAuth();
    const { account, userNetwork } = useWeb3();
    const { fNum, toFiat } = useNumbers();
    const { t } = useI18n();
    const { txListener } = useNotify();
    const { minusSlippage } = useSlippage();
    const { allTokens } = useTokens();

    const { amounts } = toRefs(data);

    const {
      requiredAllowances,
      approveAllowances,
      approving,
      approvedAll
    } = useTokenApprovals(props.pool.tokens, amounts);

    // SERVICES
    const poolExchange = new PoolExchange(
      props.pool,
      userNetwork.value.key,
      allTokens.value
    );

    const poolCalculator = new PoolCalculator(
      props.pool,
      allTokens.value,
      'join'
    );

    // COMPUTED
    const tokenWeights = computed(() => props.pool.weightsPercent);

    const hasAmounts = computed(() => {
      const amountSum = fullAmounts.value
        .map(amount => parseFloat(amount))
        .reduce((a, b) => a + b, 0);
      return amountSum > 0;
    });

    const hasValidInputs = computed(() => {
      return data.validInputs.every(validInput => validInput === true);
    });

    const balances = computed(() => {
      return props.pool.tokens.map(token => allTokens.value[token].balance);
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
      if (approvedAll.value) return false;
      return requiredAllowances.value.length > 0;
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

    const minBptOut = computed(() => {
      const poolDecimals = allTokens.value[props.pool.address].decimals;
      let bptOut = poolCalculator
        .exactTokensInForBPTOut(fullAmounts.value)
        .toString();
      bptOut = formatUnits(bptOut, poolDecimals);

      return minusSlippage(bptOut, poolDecimals);
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

    function formatBalance(index) {
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

    // Legacy function for sense check against JS calculation of BPT out
    // Left here so numbers can be debugged in conosle
    // Talk to Fernando to see if still needed
    async function calcMinBptOut(): Promise<void> {
      const poolDecimals = allTokens.value[props.pool.address].decimals;
      let { bptOut } = await poolExchange.queryJoin(
        account.value,
        fullAmounts.value
      );
      bptOut = formatUnits(bptOut.toString(), poolDecimals);
      console.log('bptOut (queryJoin)', minusSlippage(bptOut, poolDecimals));
      console.log('bptOut (JS)', minBptOut.value);
    }

    async function submit(): Promise<void> {
      if (!data.investForm.validate()) return;
      try {
        data.loading = true;
        await calcMinBptOut();
        const tx = await poolExchange.join(
          account.value,
          fullAmounts.value,
          minBptOut.value
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
      if (!hasAmounts.value && !hasZeroBalance.value) setPropMax();
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
      if (hasZeroBalance.value) {
        data.investType = FormTypes.custom;
      } else {
        setPropMax();
      }
    });

    return {
      // data
      ...toRefs(data),
      // computed
      allTokens,
      hasValidInputs,
      hasAmounts,
      approving,
      requireApproval,
      tokenWeights,
      tokenBalance,
      amountRules,
      total,
      isAuthenticated,
      connectWallet,
      formatBalance,
      isProportional,
      propPercentage,
      priceImpact,
      priceImpactClasses,
      amountUSD,
      formTypes,
      isRequired,
      hasZeroBalance,
      // methods
      submit,
      approveAllowances,
      fNum
    };
  }
});
</script>
