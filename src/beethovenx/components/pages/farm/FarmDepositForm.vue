<template>
  <BalForm ref="depositForm" @on-submit="submit">
    <div class="px-4 pt-6">
      <BalTextInput
        name="Deposit"
        v-model="amount"
        v-model:isValid="validInput"
        :rules="amountRules()"
        :disabled="loading"
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
          <div class="cursor-pointer" @click.prevent="amount = bptBalance">
            {{ $t('balance') }}:
            {{ bptBalance }}
          </div>
        </template>
        <template v-slot:append>
          <div class="p-2">
            <BalBtn
              size="xs"
              color="white"
              @click.prevent="amount = bptBalance"
            >
              {{ $t('max') }}
            </BalBtn>
          </div>
        </template>
      </BalTextInput>
    </div>

    <div class="p-4 pb-8 border-b dark:border-gray-700">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        block
        @click.prevent="toggleWalletSelectModal"
      />
      <template v-else>
        <BalBtn
          v-if="approvalRequired"
          label="Approve BPT"
          :loading="approving"
          :loading-label="$t('approving')"
          :disabled="!validInput || parseFloat(amount) === 0 || amount === ''"
          block
          @click.prevent="approveToken"
        />
        <template v-else>
          <BalBtn
            type="submit"
            :loading-label="$t('confirming')"
            color="gradient"
            :disabled="!validInput || parseFloat(amount) === 0 || amount === ''"
            :loading="depositing"
            block
            @click="trackGoal(Goals.ClickFarmDeposit)"
          >
            Deposit BPT
          </BalBtn>
        </template>
      </template>
    </div>
  </BalForm>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref,
  toRef,
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
import useNumbers from '@/composables/useNumbers';
import { scale } from '@/lib/utils';
import useFathom from '@/composables/useFathom';

import { TOKENS } from '@/constants/tokens';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';
import useEthers from '@/composables/useEthers';
import BigNumber from 'bignumber.js';
import useAllowanceAvailableQuery from '@/beethovenx/composables/farms/useAllowanceAvailableQuery';
import { DecoratedPoolWithRequiredFarm } from '@/beethovenx/services/subgraph/subgraph-types';
import useFarm from '@/beethovenx/composables/farms/useFarm';

type DataProps = {
  depositForm: FormRef;
  loading: boolean;
  amount: string;
  propMax: string[];
  validInput: boolean;
  propToken: number;
};

export default defineComponent({
  name: 'FarmDepositForm',

  components: {},

  emits: ['success'],

  props: {
    tokenAddress: {
      type: String,
      required: true
    },
    farmId: {
      type: String,
      required: true
    }
  },

  setup(props, { emit }) {
    const data = reactive<DataProps>({
      depositForm: {} as FormRef,
      loading: false,
      amount: '',
      propMax: [],
      validInput: true,
      propToken: 0
    });

    const {
      isWalletReady,
      account,
      toggleWalletSelectModal,
      appNetworkConfig
    } = useWeb3();
    const { fNum } = useNumbers();
    const { t } = useI18n();
    const { tokens, balanceFor } = useTokens();
    const { trackGoal, Goals } = useFathom();
    const { amount } = toRefs(data);
    const depositing = ref(false);
    const approving = ref(false);
    const { tokenAddress, farmId } = toRefs(props);

    const { approve, deposit } = useFarm(tokenAddress, farmId);
    const allowanceAvailableQuery = useAllowanceAvailableQuery(
      tokenAddress.value
    );
    const bptBalance = computed(() =>
      balanceFor(getAddress(tokenAddress.value))
    );

    const { txListener } = useEthers();

    function amountRules() {
      return isWalletReady.value
        ? [
            isPositive(),
            isLessThanOrEqualTo(bptBalance.value, t('exceedsBalance'))
          ]
        : [isPositive()];
    }

    async function approveToken(): Promise<void> {
      if (!data.depositForm.validate()) return;

      approving.value = true;
      const tx = await approve();

      if (!tx) {
        approving.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          await allowanceAvailableQuery.refetch.value();
          approving.value = false;
        },
        onTxFailed: () => {
          approving.value = false;
        }
      });
    }

    const approvalRequired = computed(() => {
      if (amount.value === '' || parseFloat(amount.value) === 0) {
        return false;
      }

      const availableAllowance = new BigNumber(
        allowanceAvailableQuery.data.value?.toString() || '0'
      );
      const amountScaled = scale(new BigNumber(amount.value), 18);

      return availableAllowance.lt(amountScaled);
    });

    async function submit(): Promise<void> {
      if (!data.depositForm.validate()) return;

      depositing.value = true;
      const amountScaled = scale(new BigNumber(amount.value), 18);
      const tx = await deposit(amountScaled);

      if (!tx) {
        depositing.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          await allowanceAvailableQuery.refetch.value();
          emit('success', tx);
          data.amount = '';
          depositing.value = false;
        },
        onTxFailed: () => {
          depositing.value = false;
        }
      });
    }

    /*watch(balances, (newBalances, oldBalances) => {
      const balancesChanged = !isEqual(newBalances, oldBalances);
      if (balancesChanged) {
        //
      }
    });*/

    watch(isWalletReady, isAuth => {
      if (!isAuth) {
        data.amount = '0';
        data.propMax = [];
      }
    });

    watch(account, () => {
      /*if (hasZeroBalance.value) {
        //
      } else {
        //
      }*/
    });

    onMounted(() => {
      /*if (hasZeroBalance.value) {
        //
      } else {
        //
      }*/
    });

    return {
      // data
      ...toRefs(data),

      approvalRequired,
      approveToken,
      depositing,
      approving,

      Goals,
      TOKENS,
      // computed
      tokens,
      appNetworkConfig,
      amountRules,
      isWalletReady,
      toggleWalletSelectModal,
      isRequired,
      // methods
      submit,
      fNum,
      trackGoal,
      bptBalance
    };
  }
});
</script>
