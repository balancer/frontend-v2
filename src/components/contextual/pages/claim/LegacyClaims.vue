<script setup lang="ts">
import { getAddress } from '@ethersproject/address';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import useUserClaimsQuery from '@/composables/queries/useUserClaimsQuery';
import useEthers from '@/composables/useEthers';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import useTransactions from '@/composables/useTransactions';
import { TOKENS } from '@/constants/tokens';
import { bnum } from '@/lib/utils';
import {
  ClaimService,
  MerkleOrchardVersion,
} from '@/services/claim/claim.service';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionError } from '@/types/transactions';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { useErrorMsg } from '@/lib/utils/errors';

type Props = {
  merkleOrchardVersion: MerkleOrchardVersion;
};

type ClaimableToken = {
  token: string;
  symbol: string;
  amount: string;
  fiatValue: string;
};

enum Tabs {
  CLAIMABLE = 'claimable',
}

const props = defineProps<Props>();

const { t } = useI18n();

const claimService = new ClaimService(props.merkleOrchardVersion);

const tabs = [
  { value: Tabs.CLAIMABLE, label: t('liquidityMiningPopover.tabs.claimable') },
];

const activeTab = ref(tabs[0].value);
const isClaiming = ref(false);
const claimError = ref<TransactionError | null>(null);

// COMPOSABLES
const userClaimsQuery = useUserClaimsQuery(claimService);
const { fNum } = useNumbers();
const { account, getProvider, isMismatchedNetwork } = useWeb3();
const { txListener } = useEthers();
const { addTransaction } = useTransactions();
const { priceFor, getToken } = useTokens();
const { formatErrorMsg } = useErrorMsg();

const BALTokenAddress = getAddress(TOKENS.Addresses.BAL);

// COMPUTED
const BALTokenPlaceholder = computed<ClaimableToken>(() => ({
  token: BALTokenAddress,
  symbol: getToken(BALTokenAddress)?.symbol,
  amount: '0',
  fiatValue: '0',
}));

const isLoading = computed((): boolean => isQueryLoading(userClaimsQuery));

const userClaims = computed(() =>
  userClaimsQuery.isSuccess.value ? userClaimsQuery.data?.value : null
);

const claimableTokens = computed<ClaimableToken[]>(() => {
  if (
    userClaims.value != null &&
    userClaims.value.multiTokenPendingClaims.length > 0
  ) {
    return userClaims.value.multiTokenPendingClaims.map(
      ({ availableToClaim, tokenClaimInfo }) => ({
        token: tokenClaimInfo.token,
        symbol: getToken(tokenClaimInfo.token)?.symbol,
        amount: availableToClaim,
        fiatValue: bnum(availableToClaim)
          .times(priceFor(tokenClaimInfo.token))
          .toString(),
      })
    );
  }
  return [BALTokenPlaceholder.value];
});

const totalClaimableTokensFiatValue = computed(() =>
  claimableTokens.value
    .reduce((totalValue, { fiatValue }) => totalValue.plus(fiatValue), bnum(0))
    .toString()
);

const hasClaimableTokens = computed(() =>
  claimableTokens.value.some(
    claimableToken => Number(claimableToken.amount) > 0
  )
);

watch(isMismatchedNetwork, () => {
  userClaimsQuery.refetch();
});

// METHODS
async function claimAvailableRewards() {
  if (userClaims.value != null) {
    isClaiming.value = true;
    claimError.value = null;

    try {
      const tx = await claimService.multiTokenClaimRewards(
        getProvider(),
        account.value,
        userClaims.value.multiTokenPendingClaims
      );

      const summary = claimableTokens.value
        .map(
          claimableToken =>
            `${fNum(claimableToken.amount, {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            })} ${claimableToken.symbol}`
        )
        .join(', ');

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'claim',
        summary,
      });

      txListener(tx, {
        onTxConfirmed: async () => {
          isClaiming.value = false;
          userClaimsQuery.refetch();
        },
        onTxFailed: () => {
          isClaiming.value = false;
        },
      });
    } catch (e) {
      console.log(e);
      claimError.value = formatErrorMsg(e);
      isClaiming.value = false;
    }
  }
}
</script>

<template>
  <div class="mt-4 w-full sm:w-3/4 md:w-1/2">
    <BalCard noPad class="mb-4">
      <template #header>
        <div
          class="px-3 w-full bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-900"
        >
          <BalTabs
            v-model="activeTab"
            :tabs="tabs"
            class="p-0 m-0 -mb-px whitespace-nowrap"
            noPad
          />
        </div>
      </template>
      <BalLoadingBlock v-if="isLoading" class="h-24" />
      <template v-else-if="activeTab === Tabs.CLAIMABLE">
        <template
          v-for="claimableToken in claimableTokens"
          :key="`token-${claimableToken.token}`"
        >
          <div
            class="flex items-center py-2 px-3 mb-2 last:border-0 border-b dark:border-gray-900"
          >
            <BalAsset :address="claimableToken.token" :size="36" class="mr-3" />
            <div>
              <div class="font-medium">
                {{ fNum(claimableToken.amount, FNumFormats.token) }}
                {{ claimableToken.symbol }}
              </div>
              <div class="text-gray-400 font-sm">
                {{ fNum(claimableToken.fiatValue, FNumFormats.fiat) }}
              </div>
            </div>
          </div>
        </template>
      </template>
    </BalCard>
    <BalBtn
      color="gradient"
      size="md"
      block
      class="mb-6"
      :loading="isClaiming"
      :loadingLabel="$t('claiming')"
      :disabled="!hasClaimableTokens"
      @click="claimAvailableRewards"
    >
      {{ $t('claimAll') }}
      <template v-if="hasClaimableTokens">
        ~{{ fNum(totalClaimableTokensFiatValue, FNumFormats.fiat) }}
      </template>
    </BalBtn>
    <BalAlert
      v-if="claimError != null"
      class="-mt-4 mb-6"
      type="error"
      size="md"
      :title="claimError.title"
      :description="claimError.description"
      block
      actionLabel="Dismiss"
      @action-click="claimError = null"
    />
  </div>
</template>
