<template>
  <BalForm ref="withdrawForm" @on-submit="submit">
    <FormTypeToggle
      v-model="withdrawType"
      :form-types="formTypes"
      :loading="loading"
    />

    <template v-if="isProportional">
      <div class="p-4 border-t">
        <div class="border rounded-lg shadow-inner p-2">
          <div
            class="flex items-center justify-between mb-3 text-sm text-gray-600"
          >
            <span v-text="$t('amountToWithdraw')" />
            <span>{{ propPercentage }}%</span>
          </div>
          <div class="flex items-end">
            <span
              class="mr-2 text-lg font-medium w-1/2 leading-none break-words"
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
            <div class="w-1/2 flex items-center">
              <Token :token="allTokens[token]" class="mr-2" />
              <div class="w-3/4 flex flex-col leading-none">
                <span class="break-words">
                  {{ fNum(amounts[i], 'token') }} {{ allTokens[token].symbol }}
                </span>
                <span class="text-xs text-gray-400 break-words">
                  {{ propBalanceLabel(i) }}
                  {{ $t('balance') }}
                </span>
              </div>
            </div>
            <div class="w-1/2 flex flex-col leading-none text-right pl-2">
              <span class="break-words">
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
        :key="i"
        :name="token"
        v-model="amounts[i]"
        :rules="amountRules(i)"
        type="number"
        min="0"
        step="any"
        placeholder="0"
        validate-on="input"
        prepend-border
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
            </div>
          </div>
        </template>
        <template v-if="isSingleAsset" v-slot:info>
          <div class="cursor-pointer" @click="amounts[i] = singleAssetMaxes[i]">
            {{ $t('singleTokenMax') }}: {{ singleAssetMaxLabel(i) }}
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
          <BalTooltip v-if="priceImpact < 0.01">
            <template v-slot:activator>
              <BalIcon
                name="info"
                size="xs"
                class="text-gray-400 -mb-px ml-2"
              />
            </template>
            <div v-html="$t('withdrawWarning')" class="w-52" />
          </BalTooltip>
        </div>
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
          loading-label="Confirming..."
          color="gradient"
          :disabled="!hasAmounts"
          :loading="loading"
          block
        >
          {{ $t('withdraw') }} {{ total.length > 15 ? '' : total }}
        </BalBtn>
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
import { TransactionData } from 'bnc-notify';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import useAuth from '@/composables/useAuth';
import useNumbers from '@/composables/useNumbers';
import useNotify from '@/composables/useNotify';
import useSlippage from '@/composables/useSlippage';

import PoolExchange from '@/services/pool/exchange';
import PoolCalculator from '@/services/pool/calculator';
import { bnum } from '@/utils';
import { formatUnits } from '@ethersproject/units';
import FormTypeToggle from './shared/FormTypeToggle.vue';
import useTokens from '@/composables/useTokens';

export enum FormTypes {
  proportional = 'proportional',
  single = 'single'
}

export default defineComponent({
  name: 'WithdrawalForm',

  components: {
    FormTypeToggle
  },

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
      bptIn: '',
      withdrawType: FormTypes.proportional as FormTypes,
      singleAsset: 0,
      range: 1000,
      highPiAccepted: false
    });

    // COMPOSABLES
    const store = useStore();
    const { txListener } = useNotify();
    const { isAuthenticated } = useAuth();
    const { fNum, toFiat } = useNumbers();
    const { minusSlippage, addSlippage } = useSlippage();
    const { t } = useI18n();
    const { allTokens } = useTokens();

    // SERVICES
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

    // COMPUTED
    const tokenWeights = computed(() => props.pool.weightsPercent);

    const fullAmounts = computed(() => {
      return props.pool.tokens.map((_, i) => {
        return data.amounts[i] || '0';
      });
    });

    const singleAssetMaxes = computed(() => {
      return props.pool.tokens.map((_, tokenIndex) => {
        return formatUnits(
          poolCalculator
            .exactBPTInForTokenOut(bptBalance.value, tokenIndex)
            .toString(),
          tokenDecimals(tokenIndex)
        );
      });
    });

    const propMaxUSD = computed(() => {
      const total = props.pool.tokens
        .map((token, i) => toFiat(Number(data.propMax[i]), token))
        .reduce((a, b) => a + b, 0);

      return fNum(total, 'usd');
    });

    const singleMaxUSD = computed(() => {
      const maxes = props.pool.tokens.map((token, i) =>
        toFiat(singleAssetMaxes.value[i], token)
      );

      return fNum(Math.max(...maxes), 'usd');
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

    function propBalanceLabel(index) {
      return fNum(data.propMax[index] || '0', 'token');
    }

    function singleAssetMaxLabel(index) {
      return fNum(singleAssetMaxes.value[index] || '0', 'token');
    }

    function amountUSD(index) {
      const amount = fullAmounts.value[index] || '0';
      const token = props.pool.tokens[index].toLowerCase();
      return toFiat(amount, token);
    }

    const total = computed(() => {
      const total = props.pool.tokens
        .map((_, i) => amountUSD(i))
        .reduce((a, b) => a + b, 0);

      if (total < 0) return fNum(0, 'usd');
      return fNum(total, 'usd');
    });

    const propPercentage = computed(() => {
      const maxAmount = Number(bptBalance.value);
      const currentAmount = Number(data.bptIn);
      if (!currentAmount) return 0;
      if (maxAmount === 0) return 0;
      return Math.ceil((currentAmount / maxAmount) * 100);
    });

    const isProportional = computed(() => {
      return data.withdrawType === FormTypes.proportional;
    });

    const isSingleAsset = computed(() => {
      return data.withdrawType === FormTypes.single;
    });

    const singleAssetMaxed = computed(() => {
      return (
        singleAssetMaxes.value[data.singleAsset] ===
        fullAmounts.value[data.singleAsset]
      );
    });

    const exitTokenIndex = computed(() => {
      if (isSingleAsset.value && singleAssetMaxed.value) {
        return data.singleAsset;
      }
      return null;
    });

    const exactOut = computed(() => {
      return isSingleAsset.value && !singleAssetMaxed.value;
    });

    const priceImpact = computed(() => {
      if (!hasAmounts.value || isProportional.value) return 0;
      return poolCalculator
        .priceImpact(fullAmounts.value, {
          exactOut: exactOut.value,
          tokenIndex: exitTokenIndex.value
        })
        .toNumber();
    });

    const priceImpactClasses = computed(() => {
      return {
        'text-red-500 font-medium': priceImpact.value >= 0.01,
        'text-gray-500 font-normal': priceImpact.value < 0.01
      };
    });

    const bptIn = computed(() => {
      if (isProportional.value) return data.bptIn;
      if (!exactOut.value) return bptBalance.value; // Single asset max withdrawal

      // Else single asset exact amount case
      const poolDecimals = allTokens.value[props.pool.address].decimals;
      let bptIn = poolCalculator
        .bptInForExactTokenOut(data.amounts[data.singleAsset], data.singleAsset)
        .toString();
      bptIn = formatUnits(bptIn, poolDecimals);

      return addSlippage(bptIn, poolDecimals);
    });

    const amountsOut = computed(() => {
      return fullAmounts.value.map((amount, i) => {
        if (amount === '0' || exactOut.value) return amount;
        return minusSlippage(amount, tokenDecimals(i));
      });
    });

    const formTypes = ref([
      {
        label: t('noPriceImpact'),
        max: propMaxUSD,
        value: FormTypes.proportional
      },
      {
        label: t('singleToken'),
        max: singleMaxUSD,
        value: FormTypes.single
      }
    ]);

    // METHODS
    function tokenDecimals(index) {
      return allTokens.value[props.pool.tokens[index]]?.decimals;
    }

    function amountRules(index) {
      if (!isAuthenticated.value || isProportional.value) return [isPositive()];
      return [
        isPositive(),
        isLessThanOrEqualTo(
          Number(singleAssetMaxes.value[index]),
          t('exceedsBalance')
        )
      ];
    }

    function connectWallet() {
      store.commit('web3/setAccountModal', true);
    }

    function setPropMax() {
      if (!isAuthenticated.value || bptBalance.value === 0) return;

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

    function setSingleAsset(index) {
      if (!isSingleAsset.value) return;
      data.singleAsset = index;

      props.pool.tokens.forEach((_, i) => {
        if (i === index) {
          data.amounts[i] = singleAssetMaxes.value[index];
        } else {
          data.amounts[i] = '0';
        }
      });
    }

    // Legacy function for sense check against JS calculation of BPT in
    // Left here so numbers can be debugged in conosle
    // Talk to Fernando to see if still needed
    async function calcBptIn() {
      const { bptIn: queryBptIn } = await poolExchange.queryExit(
        store.state.web3.account,
        fullAmounts.value,
        bptBalance.value,
        exitTokenIndex.value,
        exactOut.value
      );
      const poolDecimals = allTokens.value[props.pool.address].decimals;
      console.log(
        'bptIn (queryExit)',
        formatUnits(queryBptIn.toString(), poolDecimals)
      );
      console.log('bptIn (JS)', bptIn.value);
    }

    async function submit(): Promise<void> {
      if (!data.withdrawForm.validate()) return;
      try {
        data.loading = true;
        await calcBptIn();
        const tx = await poolExchange.exit(
          store.state.web3.account,
          amountsOut.value,
          bptIn.value,
          exitTokenIndex.value,
          exactOut.value
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

    watch(
      () => data.withdrawType,
      async newType => {
        if (newType === FormTypes.proportional) setPropMax();
        if (newType === FormTypes.single) {
          data.amounts = props.pool.tokens.map(() => '0');
          setSingleAsset(0);
        }
      }
    );

    watch(bptBalance, () => {
      setPropMax();
    });

    watch(
      () => data.range,
      newVal => {
        const fractionBasisPoints = (newVal / 1000) * 10000;
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
    );

    watch(allTokens, newTokens => poolCalculator.setAllTokens(newTokens));

    watch(isAuthenticated, isAuth => {
      if (!isAuth) {
        data.amounts = [];
        data.propMax = [];
      }
    });

    onMounted(async () => {
      if (bptBalance.value) setPropMax();
    });

    return {
      ...toRefs(data),
      submit,
      allTokens,
      hasAmounts,
      tokenWeights,
      fNum,
      isAuthenticated,
      connectWallet,
      total,
      isProportional,
      isSingleAsset,
      setSingleAsset,
      propPercentage,
      priceImpact,
      priceImpactClasses,
      amountRules,
      formTypes,
      propBalanceLabel,
      amountUSD,
      singleAssetMaxLabel,
      singleAssetMaxes,
      isRequired
    };
  }
});
</script>
