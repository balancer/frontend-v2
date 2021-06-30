<template>
  <BalForm ref="investForm" @on-submit="submit">
    <FormTypeToggle
      v-model="investType"
      :form-types="formTypes"
      :missing-prices="missingPrices"
      :has-zero-balance="hasZeroBalance"
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
        :class="[
          'px-4 py-3 bg-gray-50 border-b',
          hasZeroBalance ? '' : 'border-t'
        ]"
      >
        <div
          v-for="(token, i) in pool.tokenAddresses"
          :key="token"
          class="py-3 last:mb-0"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center w-1/2">
              <BalAsset :address="token" class="mr-2" />
              <div class="flex flex-col w-3/4 leading-none">
                <span
                  class="break-words"
                  :title="
                    `${fNum(amounts[i], 'token')} ${
                      pool.onchain.tokens[token].symbol
                    }`
                  "
                >
                  {{ fNum(amounts[i], 'token') }}
                  {{ pool.onchain.tokens[token].symbol }}
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
                {{ fNum(tokenWeights[i], 'percent_lg') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div
      v-else
      :class="['px-4 pt-6 border-b', hasZeroBalance ? '' : 'border-t']"
    >
      <BalTextInput
        v-for="(token, i) in pool.tokenAddresses"
        :key="token"
        :name="token"
        v-model="amounts[i]"
        v-model:isValid="validInputs[i]"
        :rules="amountRules(i)"
        type="number"
        min="0"
        step="any"
        placeholder="0"
        :decimal-limit="tokenDecimals(i)"
        :disabled="loading"
        validate-on="input"
        prepend-border
        append-shadow
      >
        <template v-slot:prepend>
          <div class="flex items-center h-full w-24">
            <BalAsset :address="token" />
            <div class="flex flex-col ml-3">
              <span class="font-medium text-sm leading-none w-14 truncate">
                {{ pool.onchain.tokens[token].symbol }}
              </span>
              <span class="leading-none text-xs mt-1 text-gray-500">
                {{ fNum(tokenWeights[i], 'percent_lg') }}
              </span>
            </div>
          </div>
        </template>
        <template v-slot:info>
          <div
            class="cursor-pointer"
            @click.prevent="amounts[i] = tokenBalance(i).toString()"
          >
            {{ $t('balance') }}: {{ formatBalance(i) }}
          </div>
        </template>
        <template v-slot:append>
          <div class="p-2">
            <BalBtn
              size="xs"
              color="white"
              @click.prevent="amounts[i] = tokenBalance(i).toString()"
            >
              {{ $t('max') }}
            </BalBtn>
          </div>
        </template>
      </BalTextInput>

      <div v-if="isWethPool" class="flex items-center mb-4">
        <router-link
          :to="{
            name: 'trade',
            params: {
              assetIn: TOKENS.AddressMap.ETH,
              assetOut: TOKENS.AddressMap.WETH
            }
          }"
          class="text-xs text-gray-500 underline"
        >
          {{ $t('wrapInstruction', [nativeAsset]) }}
        </router-link>
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="xs" class="text-gray-400 ml-2" />
          </template>
          <div class="w-52" v-html="$t('ethBufferInstruction')" />
        </BalTooltip>
      </div>
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
            <div v-html="$t('customAmountsTip')" class="w-52" />
          </BalTooltip>
        </div>
        <BalBtn
          v-if="requireApproval"
          :label="`${$t('approve')} ${symbolFor(requiredAllowances[0])}`"
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
            :rules="[isRequired(this.$t('priceImpactCheckbox'))]"
            name="highPiAccepted"
            class="text-gray-500 mb-12"
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
            @click="trackGoal(Goals.ClickInvest)"
          >
            {{ $t('invest') }}
            {{ missingPrices || total.length > 15 ? '' : total }}
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
  ref,
  PropType
} from 'vue';
import { FormRef } from '@/types';
import {
  isPositive,
  isLessThanOrEqualTo,
  isRequired
} from '@/lib/utils/validations';
import { useI18n } from 'vue-i18n';
import { TransactionData } from 'bnc-notify';
import { formatUnits } from '@ethersproject/units';
import isEqual from 'lodash/isEqual';

import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import useNumbers from '@/composables/useNumbers';
import useNotify from '@/composables/useNotify';
import useSlippage from '@/composables/useSlippage';

import PoolExchange from '@/services/pool/exchange';
import PoolCalculator from '@/services/pool/calculator';
import { bnum } from '@/lib/utils';
import FormTypeToggle from './shared/FormTypeToggle.vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import useFathom from '@/composables/useFathom';

import { TOKENS } from '@/constants/tokens';
import useVueWeb3 from '@/services/web3/useVueWeb3';
import useAccountBalances from '@/composables/useAccountBalances';
import useTokens from '@/composables/useTokens';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import useEthers from '@/composables/useEthers';

export enum FormTypes {
  proportional = 'proportional',
  custom = 'custom'
}

type DataProps = {
  investForm: FormRef;
  investType: FormTypes;
  loading: boolean;
  amounts: string[];
  propMax: string[];
  validInputs: boolean[];
  propToken: number;
  range: number;
  highPiAccepted: boolean;
};

export default defineComponent({
  name: 'InvestForm',

  components: {
    FormTypeToggle
  },

  emits: ['success'],

  props: {
    pool: { type: Object as PropType<FullPool>, required: true },
    missingPrices: { type: Boolean, default: false }
  },

  setup(props: { pool: FullPool }, { emit }) {
    const data = reactive<DataProps>({
      investForm: {} as FormRef,
      investType: FormTypes.proportional,
      loading: false,
      amounts: [],
      propMax: [],
      validInputs: [],
      propToken: 0,
      range: 1000,
      highPiAccepted: false
    });

    // COMPOSABLES
    const {
      isWalletReady,
      account,
      toggleWalletSelectModal,
      getProvider,
      appNetworkConfig,
      userNetworkConfig
    } = useVueWeb3();
    const { fNum, toFiat } = useNumbers();
    const { t } = useI18n();
    const { txListener, supportsBlocknative } = useNotify();
    const { minusSlippage } = useSlippage();
    const { tokens } = useTokens();
    const { trackGoal, Goals } = useFathom();
    const { refetchBalances } = useAccountBalances();
    const { txListener: ethersTxListener } = useEthers();

    const { amounts } = toRefs(data);

    const {
      requiredAllowances,
      approveAllowances,
      approving,
      approvedAll
    } = useTokenApprovals(props.pool.tokenAddresses, amounts);

    // SERVICES
    const poolExchange = computed(
      () =>
        new PoolExchange(
          props.pool,
          String(userNetworkConfig.value.chainId),
          tokens.value
        )
    );

    const poolCalculator = new PoolCalculator(props.pool, tokens.value, 'join');

    // COMPUTED
    const tokenWeights = computed(() =>
      Object.values(props.pool.onchain.tokens).map(t => t.weight)
    );

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
      return props.pool.tokenAddresses.map(
        token => tokens.value[token].balance
      );
    });

    const hasZeroBalance = computed(() => {
      return balances.value.map(b => Number(b)).includes(0);
    });

    const total = computed(() => {
      const total = props.pool.tokenAddresses
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
      return Math.ceil((Number(currentAmount) / Number(maxAmount)) * 100);
    });

    const fullAmounts = computed(() => {
      return props.pool.tokenAddresses.map((_, i) => {
        return data.amounts[i] || '0';
      });
    });

    const propMaxUSD = computed(() => {
      const total = props.pool.tokenAddresses
        .map((token, i) => toFiat(Number(data.propMax[i]), token))
        .reduce((a, b) => a + b, 0);

      return fNum(total, 'usd');
    });

    const balanceMaxUSD = computed(() => {
      const total = props.pool.tokenAddresses
        .map((token, i) => toFiat(balances.value[i], token))
        .reduce((a, b) => a + b, 0);

      return fNum(total, 'usd');
    });

    const priceImpact = computed(() => {
      if (isProportional.value || !hasAmounts.value) return 0;
      return poolCalculator.priceImpact(fullAmounts.value).toNumber() || 0;
    });

    const priceImpactClasses = computed(() => {
      return {
        'text-red-500 font-medium': priceImpact.value >= 0.01,
        'text-gray-500 font-normal': priceImpact.value < 0.01
      };
    });

    const minBptOut = computed(() => {
      let bptOut = poolCalculator
        .exactTokensInForBPTOut(fullAmounts.value)
        .toString();
      bptOut = formatUnits(bptOut, props.pool.onchain.decimals);

      return minusSlippage(bptOut, props.pool.onchain.decimals);
    });

    const nativeAsset = computed(() => appNetworkConfig.nativeAsset.symbol);

    const isWethPool = computed(() =>
      props.pool.tokenAddresses.includes(TOKENS.AddressMap.WETH)
    );

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
    function tokenBalance(index: number): string {
      return tokens.value[props.pool.tokenAddresses[index]]?.balance || '0';
    }

    function tokenDecimals(index) {
      return tokens.value[props.pool.tokenAddresses[index]].decimals;
    }

    function amountUSD(index) {
      const amount = fullAmounts.value[index] || 0;
      return toFiat(amount, props.pool.tokenAddresses[index]);
    }

    function formatBalance(index) {
      return fNum(tokenBalance(index), 'token');
    }

    function amountRules(index) {
      return isWalletReady.value
        ? [
            isPositive(),
            isLessThanOrEqualTo(
              Number(tokenBalance(index)),
              t('exceedsBalance')
            )
          ]
        : [isPositive()];
    }

    function symbolFor(token) {
      return tokens.value[token]?.symbol || '';
    }

    async function setPropMax() {
      const { send, fixedToken } = poolCalculator.propMax();
      data.propMax = [...send];
      data.propToken = fixedToken;
    }

    function resetSlider() {
      data.amounts = [...data.propMax];
      data.range = 1000;
    }

    function setPropAmountsFor(range) {
      const fractionBasisPoints = (range / 1000) * 10000;
      const amount = bnum(balances.value[data.propToken])
        .times(fractionBasisPoints)
        .div(10000)
        .toFixed(tokenDecimals(data.propToken));

      const { send } = poolCalculator.propAmountsGiven(
        amount,
        data.propToken,
        'send'
      );
      data.amounts = send;
    }

    // Legacy function for sense check against JS calculation of BPT out
    // Left here so numbers can be debugged in conosle
    // Talk to Fernando to see if still needed
    async function calcMinBptOut(): Promise<void> {
      let { bptOut } = await poolExchange.value.queryJoin(
        getProvider(),
        account.value,
        fullAmounts.value
      );
      bptOut = formatUnits(bptOut.toString(), props.pool.onchain.decimals);
      console.log(
        'bptOut (queryJoin)',
        minusSlippage(bptOut, props.pool.onchain.decimals)
      );
      console.log('bptOut (JS)', minBptOut.value);
    }

    function blocknativeTxHandler(tx: TransactionResponse): void {
      txListener(tx.hash, {
        onTxConfirmed: async (tx: TransactionData) => {
          emit('success', tx);
          data.amounts = [];
          data.loading = false;
          await refetchBalances.value();
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
        },
        onTxFailed: () => {
          data.loading = false;
        }
      });
    }

    async function submit(): Promise<void> {
      if (!data.investForm.validate()) return;
      try {
        data.loading = true;
        await calcMinBptOut();
        const tx = await poolExchange.value.join(
          getProvider(),
          account.value,
          fullAmounts.value,
          minBptOut.value
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

    watch(tokens, newTokens => {
      poolCalculator.setAllTokens(newTokens);
    });

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

    watch(balances, (newBalances, oldBalances) => {
      const balancesChanged = !isEqual(newBalances, oldBalances);
      if (balancesChanged) {
        setPropMax();
        if (isProportional.value) setPropAmountsFor(data.range);
      }
    });

    watch(
      () => data.investType,
      newType => {
        if (newType === FormTypes.proportional) {
          setPropMax();
          resetSlider();
        }
      }
    );

    watch(
      () => data.range,
      newVal => {
        setPropAmountsFor(newVal);
      }
    );

    watch(isWalletReady, isAuth => {
      if (!isAuth) {
        data.amounts = [];
        data.propMax = [];
      }
    });

    watch(account, () => {
      if (hasZeroBalance.value) {
        data.investType = FormTypes.custom;
      } else {
        setPropMax();
        resetSlider();
      }
    });

    onMounted(() => {
      if (hasZeroBalance.value) {
        data.investType = FormTypes.custom;
      } else {
        setPropMax();
        resetSlider();
      }
    });

    return {
      // data
      ...toRefs(data),
      Goals,
      nativeAsset,
      TOKENS,
      // computed
      tokens,
      hasValidInputs,
      hasAmounts,
      approving,
      requireApproval,
      requiredAllowances,
      tokenWeights,
      tokenBalance,
      amountRules,
      total,
      isWalletReady,
      toggleWalletSelectModal,
      formatBalance,
      isProportional,
      propPercentage,
      priceImpact,
      priceImpactClasses,
      amountUSD,
      formTypes,
      isRequired,
      hasZeroBalance,
      isWethPool,
      // methods
      submit,
      approveAllowances,
      fNum,
      trackGoal,
      symbolFor,
      tokenDecimals
    };
  }
});
</script>
