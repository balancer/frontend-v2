<template>
  <BalForm ref="withdrawForm" @on-submit="submit">
    <FormTypeToggle
      v-model="withdrawType"
      :form-types="formTypes"
      :loading="loading"
    />

    <template v-if="isProportional">
      <div class="p-4 border-t dark:border-gray-900">
        <div class="border dark:border-gray-900 rounded-lg shadow-inner p-2">
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
              {{ missingPrices ? '-' : total }}
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

      <div
        class="px-4 py-3 bg-gray-50 dark:bg-gray-850 border-t dark:border-gray-900 border-b"
      >
        <div
          v-for="(token, i) in pool.tokenAddresses"
          :key="token"
          class="py-3 last:mb-0"
        >
          <div class="flex items-center justify-between">
            <div class="w-1/2 flex items-center">
              <BalAsset :address="token" class="mr-2" />
              <div class="w-3/4 flex flex-col leading-none">
                <span class="break-words">
                  {{ fNum(amounts[i], 'token') }}
                  {{ pool.onchain.tokens[token].symbol }}
                </span>
                <span class="text-xs text-gray-400 break-words">
                  {{ $t('balance') }}: {{ formatPropBalance(i) }}
                </span>
              </div>
            </div>
            <div class="w-1/2 flex flex-col leading-none text-right pl-2">
              <span class="break-words">
                {{ amountUSD(i) === 0 ? '-' : fNum(amountUSD(i), 'usd') }}
              </span>
              <span class="text-xs text-gray-400">
                {{ fNum(tokenWeights[i], 'percent_lg') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="px-4 pt-6 border-t border-b dark:border-gray-900">
      <BalTextInput
        v-for="(token, i) in pool.tokenAddresses"
        :key="i"
        :name="token"
        v-model="amounts[i]"
        :rules="amountRules(i)"
        type="number"
        min="0"
        step="any"
        placeholder="0"
        :decimal-limit="tokenDecimals(i)"
        validate-on="input"
        prepend-border
        :faded-out="isSingleAsset && singleAsset !== i"
        @click="setSingleAsset(i)"
      >
        <template v-slot:prepend>
          <div class="flex items-center h-full w-24">
            <BalAsset :address="token" />
            <div class="flex flex-col ml-3">
              <span class="font-medium text-sm leading-none w-14 truncate">
                {{ pool.onchain.tokens[token].symbol }}
              </span>
            </div>
          </div>
        </template>
        <template v-if="isSingleAsset" v-slot:info>
          <div
            class="cursor-pointer"
            @click.prevent="amounts[i] = singleAssetMaxes[i]"
          >
            {{ $t('singleTokenMax') }}: {{ singleAssetMaxLabel(i) }}
          </div>
        </template>
        <template v-slot:append>
          <div class="p-2">
            <BalBtn
              size="xs"
              color="white"
              @click.prevent="amounts[i] = singleAssetMaxes[i]"
            >
              {{ $t('max') }}
            </BalBtn>
          </div>
        </template>
      </BalTextInput>
    </div>

    <div class="p-4">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        block
        @click.prevent="toggleWalletSelectModal"
      />
      <template v-else>
        <div
          :class="['flex items-center text-sm mb-4', priceImpactClasses]"
          @click.prevent
        >
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
            <div v-html="$t('withdrawWarning')" class="w-52" />
          </BalTooltip>
        </div>
        <BalCheckbox
          v-if="priceImpact >= 0.01"
          v-model="highPiAccepted"
          :rules="[isRequired($t('priceImpactCheckbox'))]"
          name="highPiAccepted"
          class="text-gray-500 mb-8"
          size="sm"
          :label="$t('priceImpactAccept')"
        />
        <BalBtn
          type="submit"
          :loading-label="$t('confirming')"
          color="gradient"
          :disabled="!hasAmounts"
          :loading="loading"
          block
          @click="trackGoal(Goals.ClickWithdraw)"
        >
          {{ $t('withdraw') }}
          {{ missingPrices || total.length > 15 ? '' : total }}
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
  ref,
  PropType
} from 'vue';
import { FormRef } from '@/types';
import {
  isPositive,
  isLessThanOrEqualTo,
  isRequired
} from '@/lib/utils/validations';
import { TransactionData } from 'bnc-notify';
import { useI18n } from 'vue-i18n';
import isEqual from 'lodash/isEqual';

import useNumbers from '@/composables/useNumbers';
import useNotify from '@/composables/useNotify';
import useSlippage from '@/composables/useSlippage';

import PoolExchange from '@/services/pool/exchange';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { bnum } from '@/lib/utils';
import { formatUnits } from '@ethersproject/units';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import FormTypeToggle from './shared/FormTypeToggle.vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import useFathom from '@/composables/useFathom';
import useVueWeb3 from '@/services/web3/useVueWeb3';
import useAccountBalances from '@/composables/useAccountBalances';
import useTokens from '@/composables/useTokens';
import useEthers from '@/composables/useEthers';

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
    pool: { type: Object as PropType<FullPool>, required: true },
    missingPrices: { type: Boolean, default: false }
  },

  setup(props: { pool: FullPool }, { emit }) {
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
    const {
      isWalletReady,
      toggleWalletSelectModal,
      getProvider,
      account,
      userNetworkConfig
    } = useVueWeb3();
    const { txListener, supportsBlocknative } = useNotify();
    const { fNum, toFiat } = useNumbers();
    const { minusSlippage, addSlippage } = useSlippage();
    const { t } = useI18n();
    const { tokens } = useTokens();
    const { trackGoal, Goals } = useFathom();
    const { txListener: ethersTxListener } = useEthers();
    const { refetchBalances } = useAccountBalances();

    // SERVICES
    const poolExchange = computed(
      () =>
        new PoolExchange(props.pool, userNetworkConfig.value.key, tokens.value)
    );

    const poolCalculator = new PoolCalculator(props.pool, tokens.value, 'exit');

    // COMPUTED
    const tokenWeights = computed(() =>
      Object.values(props.pool.onchain.tokens).map(t => t.weight)
    );

    const fullAmounts = computed(() => {
      return props.pool.tokenAddresses.map((_, i) => {
        return data.amounts[i] || '0';
      });
    });

    const singleAssetMaxes = computed(() => {
      return props.pool.tokenAddresses.map((_, tokenIndex) => {
        return formatUnits(
          poolCalculator
            .exactBPTInForTokenOut(bptBalance.value.toString(), tokenIndex)
            .toString(),
          tokenDecimals(tokenIndex)
        );
      });
    });

    const propMaxUSD = computed(() => {
      const total = props.pool.tokenAddresses
        .map((token, i) => toFiat(Number(data.propMax[i]), token))
        .reduce((a, b) => a + b, 0);

      return fNum(total, 'usd');
    });

    const singleMaxUSD = computed(() => {
      const maxes = props.pool.tokenAddresses.map((token, i) =>
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
      return tokens.value[props.pool.address].balance;
    });

    function formatPropBalance(index) {
      return fNum(data.propMax[index] || '0', 'token');
    }

    function singleAssetMaxLabel(index) {
      return fNum(singleAssetMaxes.value[index] || '0', 'token');
    }

    function amountUSD(index) {
      const amount = fullAmounts.value[index] || '0';
      return toFiat(amount, props.pool.tokenAddresses[index]);
    }

    const total = computed(() => {
      const total = props.pool.tokenAddresses
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
      let bptIn = poolCalculator
        .bptInForExactTokenOut(data.amounts[data.singleAsset], data.singleAsset)
        .toString();
      bptIn = formatUnits(bptIn, props.pool.onchain.decimals);

      return addSlippage(bptIn, props.pool.onchain.decimals);
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
      return tokens.value[props.pool.tokenAddresses[index]].decimals;
    }

    function amountRules(index) {
      if (!isWalletReady.value || isProportional.value) return [isPositive()];
      return [
        isPositive(),
        isLessThanOrEqualTo(
          Number(singleAssetMaxes.value[index]),
          t('exceedsBalance')
        )
      ];
    }

    function setPropMax(ignoreBptCheck = false) {
      if (
        !isWalletReady.value ||
        (!ignoreBptCheck && Number(bptBalance.value) === 0)
      )
        return;
      const { send, receive } = poolCalculator.propAmountsGiven(
        bptBalance.value,
        0,
        'send'
      );
      data.bptIn = send[0];
      data.propMax = [...receive];
    }

    function resetSlider() {
      data.amounts = [...data.propMax];
      data.range = 1000;
    }

    function setPropAmountsFor(range) {
      const fractionBasisPoints = (range / 1000) * 10000;
      const bpt = bnum(bptBalance.value)
        .times(fractionBasisPoints)
        .div(10000)
        .toFixed(props.pool.onchain.decimals);

      const { send, receive } = poolCalculator.propAmountsGiven(bpt, 0, 'send');
      data.bptIn = send[0];
      data.amounts = receive;
    }

    function setSingleAsset(index) {
      if (!isSingleAsset.value) return;
      data.singleAsset = index;

      props.pool.tokenAddresses.forEach((_, i) => {
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
      const { bptIn: queryBptIn } = await poolExchange.value.queryExit(
        getProvider(),
        account.value,
        fullAmounts.value,
        bptBalance.value,
        exitTokenIndex.value,
        exactOut.value
      );
      console.log(
        'bptIn (queryExit)',
        formatUnits(queryBptIn.toString(), props.pool.onchain.decimals)
      );
      console.log('bptIn (JS)', bptIn.value);
    }

    function blocknativeTxHandler(tx: TransactionResponse): void {
      txListener(tx.hash, {
        onTxConfirmed: async (tx: TransactionData) => {
          emit('success', tx);
          data.amounts = [];
          data.loading = false;
          await refetchBalances.value();
          setPropMax(true);
        },
        onTxCancel: () => {
          data.loading = false;
        },
        onTxFailed: () => {
          data.loading = false;
        }
      });
    }

    function ethersTxHandler(tx: TransactionResponse): void {
      ethersTxListener(tx, {
        onTxConfirmed: async (tx: TransactionResponse) => {
          emit('success', tx);
          data.amounts = [];
          data.loading = false;
          await refetchBalances.value();
          setPropMax(true);
        },
        onTxFailed: () => {
          data.loading = false;
        }
      });
    }

    async function submit(): Promise<void> {
      if (!data.withdrawForm.validate()) return;
      try {
        data.loading = true;
        await calcBptIn();
        const tx = await poolExchange.value.exit(
          getProvider(),
          account.value,
          amountsOut.value,
          `${bptIn.value}`,
          exitTokenIndex.value,
          exactOut.value
        );
        console.log('Receipt', tx);
        if (supportsBlocknative.value) {
          blocknativeTxHandler(tx);
        } else {
          ethersTxHandler(tx);
        }
      } catch (error) {
        console.error(error);
        data.loading = false;
      }
    }

    watch(
      () => props.pool.onchain.tokens,
      (newTokens, oldTokens) => {
        poolCalculator.setPool(props.pool);
        const tokensChanged = !isEqual(newTokens, oldTokens);
        if (tokensChanged) {
          setPropMax();
          if (isProportional.value) setPropAmountsFor(data.range);
        }
      }
    );

    watch(
      () => data.withdrawType,
      async newType => {
        if (newType === FormTypes.proportional) {
          setPropMax();
          resetSlider();
        } else if (newType === FormTypes.single) {
          data.amounts = props.pool.tokenAddresses.map(() => '0');
          setSingleAsset(0);
        }
      }
    );

    watch(bptBalance, () => {
      setPropMax();
      if (isProportional.value) setPropAmountsFor(data.range);
    });

    watch(
      () => data.range,
      newVal => {
        setPropAmountsFor(newVal);
      }
    );

    watch(tokens, newTokens => {
      poolCalculator.setAllTokens(newTokens);
    });

    watch(isWalletReady, isReady => {
      if (!isReady) {
        data.amounts = [];
        data.propMax = [];
      }
    });

    watch(account, () => {
      setPropMax();
      resetSlider();
    });

    onMounted(async () => {
      if (bptBalance.value) {
        setPropMax();
        resetSlider();
      }
    });

    return {
      ...toRefs(data),
      submit,
      tokens,
      hasAmounts,
      tokenWeights,
      fNum,
      isWalletReady,
      toggleWalletSelectModal,
      total,
      isProportional,
      isSingleAsset,
      setSingleAsset,
      propPercentage,
      priceImpact,
      priceImpactClasses,
      amountRules,
      formTypes,
      formatPropBalance,
      amountUSD,
      singleAssetMaxLabel,
      singleAssetMaxes,
      isRequired,
      trackGoal,
      Goals,
      tokenDecimals
    };
  }
});
</script>
