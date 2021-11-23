<template>
  <BalForm ref="withdrawForm" @on-submit="submit">
    <div>
      <BalTextInput
        name="Withdraw"
        v-model="amount"
        v-model:isValid="validInput"
        :rules="amountRules()"
        :disabled="withdrawing"
        type="number"
        min="0"
        step="any"
        placeholder="0"
        :decimal-limit="18"
        validate-on="input"
        prepend-border
        append-shadow
      >
        <template v-slot:info>
          <div
            class="cursor-pointer flex"
            @click.prevent="amount = bptDeposited"
          >
            {{ $t('balance') }}:
            <BalLoadingBlock v-if="loading" class="h-4 w-24 ml-1" white />
            <span v-else>&nbsp;{{ bptDeposited }}</span>
          </div>
        </template>
        <template v-slot:append>
          <div class="p-2">
            <BalBtn
              size="xs"
              color="white"
              @click.prevent="amount = bptDeposited"
            >
              {{ $t('max') }}
            </BalBtn>
          </div>
        </template>
      </BalTextInput>
    </div>

    <div class="pt-4">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        block
        @click.prevent="toggleWalletSelectModal"
      />
      <template v-else>
        <BalBtn
          type="submit"
          :loading-label="loading ? 'Loading' : $t('confirming')"
          color="gradient"
          :disabled="!validInput || amount === '0' || amount === ''"
          :loading="withdrawing || loading"
          block
          @click="trackGoal(Goals.ClickFarmWithdraw)"
        >
          Burn fBEETS
        </BalBtn>
      </template>
    </div>
  </BalForm>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch
} from 'vue';
import { FormRef } from '@/types';
import {
  isLessThanOrEqualTo,
  isPositive,
  isRequired
} from '@/lib/utils/validations';
import { useI18n } from 'vue-i18n';
import { scale, scaleDown, sleep } from '@/lib/utils';
import useFathom from '@/composables/useFathom';

import { TOKENS } from '@/constants/tokens';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import { BigNumber } from 'bignumber.js';
import useEthers from '@/composables/useEthers';
import { useFreshBeets } from '@/beethovenx/composables/stake/useFreshBeets';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import useFarmUser from '@/beethovenx/composables/farms/useFarmUser';

type DataProps = {
  withdrawForm: FormRef;
  amount: string;
  propMax: string[];
  validInput: boolean;
  propToken: number;
};
export default defineComponent({
  name: 'FreshBeetsWithdrawForm',
  components: {},
  emits: ['success'],

  props: {
    loading: {
      type: Boolean,
      required: true
    }
  },

  setup(props, { emit }) {
    const data = reactive<DataProps>({
      withdrawForm: {} as FormRef,
      amount: '',
      propMax: [],
      validInput: true,
      propToken: 0
    });

    const {
      userUnstakedFbeetsBalance,
      unStake,
      freshBeetsQuery
    } = useFreshBeets();

    const { txListener } = useEthers();
    const {
      isWalletReady,
      account,
      toggleWalletSelectModal,
      appNetworkConfig
    } = useWeb3();
    const withdrawing = ref(false);
    const { t } = useI18n();
    const { tokens } = useTokens();
    const { trackGoal, Goals } = useFathom();
    const { amount } = toRefs(data);
    const { refetchBalances } = useTokens();
    const { farmUserRefetch } = useFarmUser(appNetworkConfig.fBeets.farmId);

    const bptDeposited = computed(() => {
      return userUnstakedFbeetsBalance.value.toString();
    });

    function amountRules() {
      return isWalletReady.value && bptDeposited.value !== '0'
        ? [
            isPositive(),
            isLessThanOrEqualTo(bptDeposited.value, t('exceedsBalance'))
          ]
        : [isPositive()];
    }

    async function submit(): Promise<void> {
      if (!data.withdrawForm.validate()) return;

      try {
        withdrawing.value = true;
        const amountScaled = scale(new BigNumber(amount.value), 18);
        const tx = await unStake(amountScaled.toString());

        if (!tx) {
          withdrawing.value = false;
          return;
        }

        txListener(tx, {
          onTxConfirmed: async () => {
            emit('success', tx);
            amount.value = '';
            await freshBeetsQuery.refetch.value();
            withdrawing.value = false;
          },
          onTxFailed: () => {
            withdrawing.value = false;
          }
        });
      } catch {
        withdrawing.value = false;
      }
    }

    watch(isWalletReady, isAuth => {
      if (!isAuth) {
        data.amount = '0';
        data.propMax = [];
      }
    });

    watch(account, () => {
      //
    });

    onMounted(() => {
      //
    });

    return {
      // data
      ...toRefs(data),
      withdrawing,

      Goals,
      TOKENS,
      // computed
      tokens,
      amountRules,
      isWalletReady,
      toggleWalletSelectModal,
      isRequired,
      // methods
      submit,
      trackGoal,
      bptDeposited
    };
  }
});
</script>
