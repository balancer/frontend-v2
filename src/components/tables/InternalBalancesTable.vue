<script lang="ts" setup>
import { orderBy } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ColumnDefinition } from '@/components/_global/BalTable/types';

import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import { vaultService } from '@/services/contracts/vault.service';
import useWeb3 from '@/services/web3/useWeb3';
import { bnum, selectByAddress, trackLoading } from '@/lib/utils';
import { formatUnits, parseUnits } from '@ethersproject/units';
import TxActionBtn from '@/components/btns/TxActionBtn/TxActionBtn.vue';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
export type InternalBalanceRow = TokenInfo & {
  balance: string;
  value: string;
  price: string;
};

/**
 * STATE
 */
const internalBalances = ref<InternalBalanceRow[]>([]);
const loading = ref(true);
const externalWithdrawActions = {
  '0xEb91861f8A4e1C12333F42DCE8fB0Ecdc28dA716':
    'https://redemptions.euler.finance/',
  '0x4d19F33948b99800B6113Ff3e83beC9b537C85d2':
    'https://redemptions.euler.finance/',
  '0xe025E3ca2bE02316033184551D4d3Aa22024D9DC':
    'https://redemptions.euler.finance/',
};

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();
const { fNum } = useNumbers();
const { priceFor, getToken, tokens } = useTokens();
const { account } = useWeb3();

/**
 * METHODS
 */
function withdraw(asset: string) {
  const kind = 1; // OP_KIND.WithdrawInternal
  const balance = internalBalances.value.find(b => b.address === asset);
  const amount = parseUnits(
    balance?.balance || '0',
    balance?.decimals
  ).toString();
  return () =>
    vaultService.manageUserBalance({
      kind,
      asset,
      amount,
      sender: account.value,
      recipient: account.value,
    });
}

/**
 * Fetches internal balances for all tokens in registry, merges them with token
 * info, exlcudes zero balances, and sorts by value.
 */
async function getInternalBalances() {
  const tokenAddresses = Object.keys(tokens.value);
  const balances = await vaultService.getInternalBalance(
    account.value,
    tokenAddresses
  );

  const balancesWithAddress = tokenAddresses
    .map((address, i) => {
      const token = getToken(address);
      const balance = formatUnits(balances[i], token.decimals);
      const price = priceFor(address);
      const value = bnum(balance).times(price).toString();

      if (bnum(balance).lte(0)) return null;
      if (!token.decimals && !token.name && !token.symbol) return null;

      return {
        ...token,
        balance,
        price,
        value,
      };
    })
    .filter(b => b) as unknown as InternalBalanceRow[];

  internalBalances.value = orderBy(
    balancesWithAddress,
    ['value', 'balance'],
    ['desc', 'desc']
  );
}

/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  if (account.value) {
    trackLoading(getInternalBalances, loading);
  } else {
    loading.value = false;
  }
});

/**
 * WATCHERS
 */
watch(account, async newAccount => {
  if (newAccount) {
    trackLoading(getInternalBalances, loading);
  } else {
    internalBalances.value = [];
    loading.value = false;
  }
});

/**
 * TABLE
 */
const columns = ref<ColumnDefinition<any>[]>([
  {
    name: 'Token',
    id: 'token',
    accessor: 'token',
    Cell: 'tokenColumnCell',
    width: 475,
    noGrow: true,
  },
  {
    name: t('balance'),
    id: 'Balance',
    align: 'right',
    width: 150,
    accessor: ({ balance }) => `${fNum(balance, FNumFormats.token)}`,
  },
  {
    name: t('value'),
    id: 'value',
    align: 'right',
    width: 150,
    accessor: ({ value }) =>
      bnum(value).eq(0) ? '-' : fNum(value, FNumFormats.fiat),
  },
  {
    name: '',
    id: 'withdraw',
    align: 'right',
    accessor: 'withdraw',
    Cell: 'withdrawColumnCell',
    width: 150,
  },
]);
</script>

<template>
  <BalCard
    shadow="lg"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="internalBalances"
      skeletonClass="h-64"
      :square="upToLargeBreakpoint"
      :isLoading="loading"
    >
      <template #tokenColumnCell="{ symbol, address }">
        <div class="flex items-center py-4 px-6">
          <BalAsset :address="address" />
          <span class="ml-2">{{ symbol }}</span>
        </div>
      </template>
      <template #withdrawColumnCell="{ address, value }">
        <div class="flex justify-end py-4 px-6">
          <BalBtn
            v-if="selectByAddress(externalWithdrawActions, address)"
            tag="a"
            :href="selectByAddress(externalWithdrawActions, address)"
            target="_blank"
            rel="noopener noreferrer"
            external
            color="gradient"
            size="sm"
            >{{ $t('redeem') }}
            <BalIcon name="arrow-up-right" size="sm" class="ml-1"
          /></BalBtn>
          <TxActionBtn
            v-else
            :label="$t('transactionAction.withdraw')"
            color="gradient"
            size="sm"
            :actionFn="withdraw(address)"
            action="withdraw"
            :summary="
              $t('transactionSummary.withdrawFromBalance', [
                fNum(value, FNumFormats.fiat),
              ])
            "
            :confirmingLabel="`${$t('withdrawing')}...`"
            @confirmed="getInternalBalances"
          />
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>
