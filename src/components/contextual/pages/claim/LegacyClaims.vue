<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';
import { differenceInSeconds } from 'date-fns';
import { getAddress } from 'ethers/lib/utils';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import BalLink from '@/components/_global/BalLink/BalLink.vue';
import useUserClaimsQuery from '@/composables/queries/useUserClaimsQuery';
import useEthers from '@/composables/useEthers';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { oneSecondInMs } from '@/composables/useTime';
import useTokens from '@/composables/useTokens';
import useTranasactionErrors from '@/composables/useTransactionErrors';
import useTransactions from '@/composables/useTransactions';
import { TOKENS } from '@/constants/tokens';
import { bnum } from '@/lib/utils';
import { claimService } from '@/services/claim/claim.service';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionError } from '@/types/transactions';

type ClaimableToken = {
  token: string;
  symbol: string;
  amount: string;
  fiatValue: string;
};

enum Tabs {
  CLAIMABLE = 'claimable',
  CURRENT_ESTIMATE = 'currentEstimate',
}

const { t } = useI18n();

const tabs = [
  { value: Tabs.CLAIMABLE, label: t('liquidityMiningPopover.tabs.claimable') },
  {
    value: Tabs.CURRENT_ESTIMATE,
    label: t('liquidityMiningPopover.tabs.currentEstimate'),
  },
];

const activeTab = ref(tabs[0].value);
const isClaiming = ref(false);
const elapstedTimeSinceEstimateTimestamp = ref(0);
const claimError = ref<TransactionError | null>(null);

// COMPOSABLES
const userClaimsQuery = useUserClaimsQuery();
const { fNum2 } = useNumbers();
const {
  account,
  getProvider,
  isArbitrum,
  isMainnet,
  isKovan,
  isPolygon,
  isMismatchedNetwork,
} = useWeb3();
const { txListener } = useEthers();
const { addTransaction } = useTransactions();
const { priceFor, getToken } = useTokens();
const { parseError } = useTranasactionErrors();

const BALTokenAddress = getAddress(TOKENS.Addresses.BAL);

// COMPUTED
const BALTokenPlaceholder = computed<ClaimableToken>(() => ({
  token: BALTokenAddress,
  symbol: getToken(BALTokenAddress)?.symbol,
  amount: '0',
  fiatValue: '0',
}));

// Polygon used to be an airdrop, now its claimable - leaving it here in case new networks will need to be airdropped first.
const isAirdrop = false;

const legacyClaimUI = computed(() => {
  if (isMainnet.value || isKovan.value) {
    return [
      { token: '$BAL', subdomain: 'claim' },
      { token: '$VITA', subdomain: 'claim-vita' },
      { token: '$LDO', subdomain: 'claim-lido' },
    ];
  } else if (isArbitrum.value) {
    return [
      { token: '$BAL', subdomain: 'claim-arbitrum' },
      { token: '$MCDEX', subdomain: 'claim-mcdex' },
      { token: '$PICKLE', subdomain: 'claim-pickle' },
    ];
  }

  return [];
});

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

const currentEstimateClaimableTokens = computed<ClaimableToken[]>(() => {
  if (
    userClaims.value != null &&
    userClaims.value.multiTokenCurrentRewardsEstimate.length > 0
  ) {
    return userClaims.value.multiTokenCurrentRewardsEstimate.map(
      ({ token, rewards, velocity }) => {
        const rewardsSinceTimestamp = bnum(velocity).times(
          elapstedTimeSinceEstimateTimestamp.value
        );
        const totalRewards = bnum(rewards).plus(rewardsSinceTimestamp);

        return {
          token,
          symbol: getToken(token)?.symbol,
          amount: totalRewards.toString(),
          fiatValue: totalRewards.times(priceFor(token)).toString(),
        };
      }
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

useIntervalFn(async () => {
  if (userClaims.value != null && userClaims.value.timestamp != null) {
    const diffInSeconds = differenceInSeconds(
      new Date(),
      new Date(userClaims.value.timestamp)
    );
    elapstedTimeSinceEstimateTimestamp.value = diffInSeconds;
  }
}, oneSecondInMs);

watch(isMismatchedNetwork, () => {
  userClaimsQuery.refetch.value();
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
            `${fNum2(claimableToken.amount, {
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
        onTxConfirmed: () => {
          isClaiming.value = false;
          userClaimsQuery.refetch.value();
        },
        onTxFailed: () => {
          isClaiming.value = false;
        },
      });
    } catch (e) {
      console.log(e);
      claimError.value = parseError(e);
      isClaiming.value = false;
    }
  }
}
</script>

<template>
  <div v-if="userClaims != null" class="mt-4 w-full sm:w-3/4 md:w-1/2">
    <div v-if="isAirdrop" class="mb-1 text-sm text-gray-600">
      {{ $t('liquidityMiningPopover.airdropExplainer', ['Polygon']) }}
    </div>
    <div v-if="!isAirdrop" class="">
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
        <template v-if="activeTab === Tabs.CLAIMABLE">
          <template
            v-for="claimableToken in claimableTokens"
            :key="`token-${claimableToken.token}`"
          >
            <div
              class="flex items-center py-2 px-3 mb-2 last:border-0 border-b dark:border-gray-900"
            >
              <BalAsset
                :address="claimableToken.token"
                :size="36"
                class="mr-3"
              />
              <div>
                <div class="font-medium">
                  {{ fNum2(claimableToken.amount, FNumFormats.token) }}
                  {{ claimableToken.symbol }}
                </div>
                <div class="text-gray-400 font-sm">
                  {{ fNum2(claimableToken.fiatValue, FNumFormats.fiat) }}
                </div>
              </div>
            </div>
          </template>
        </template>
        <template v-if="activeTab === Tabs.CURRENT_ESTIMATE">
          <template
            v-for="claimableToken in currentEstimateClaimableTokens"
            :key="`token-${claimableToken.token}`"
          >
            <div
              class="flex items-center py-2 px-3 mb-2 last:border-0 border-b dark:border-gray-900"
            >
              <BalAsset
                :address="claimableToken.token"
                :size="36"
                class="mr-3"
              />
              <div>
                <div class="font-medium">
                  {{ fNum2(claimableToken.amount, FNumFormats.token) }}
                  {{ claimableToken.symbol }}
                </div>
                <div class="text-gray-400 font-sm">
                  {{ fNum2(claimableToken.fiatValue, FNumFormats.fiat) }}
                </div>
              </div>
            </div>
          </template>
        </template>
      </BalCard>
      <BalBtn
        v-if="!isAirdrop"
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
          ~{{ fNum2(totalClaimableTokensFiatValue, FNumFormats.fiat) }}
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
    <div v-if="!isAirdrop">
      <div class="mb-4">
        <div class="mb-2 font-semibold">
          Looking for other claimable tokens?
        </div>
        <ul class="pl-8 list-disc">
          <li v-if="legacyClaimUI.length > 0" class="mt-2">
            Claim
            <span class="inline-grid grid-flow-col gap-1">
              <BalLink
                v-for="legacyClaim in legacyClaimUI"
                :key="`token-${legacyClaim.token}`"
                :href="`https://${legacyClaim.subdomain}.balancer.fi/#/${account}`"
                external
                >{{ legacyClaim.token }}</BalLink
              >
            </span>
            from legacy liquidity mining contracts distributed before 20 Oct,
            2021.
          </li>
          <li class="mt-2">
            Claim BAL on other networks
            <template v-if="isArbitrum">
              <BalLink href="https://app.balancer.fi" external>
                Ethereum
              </BalLink>
              and
              <BalLink href="https://polygon.balancer.fi" external>
                Polygon </BalLink
              >.
            </template>
            <template v-else-if="isPolygon">
              <BalLink href="https://app.balancer.fi" external>
                Ethereum
              </BalLink>
              and
              <BalLink href="https://arbitrum.balancer.fi" external>
                Arbitrum </BalLink
              >.
            </template>
            <template v-else-if="isMainnet || isKovan">
              <BalLink href="https://polygon.balancer.fi" external>
                Polygon
              </BalLink>
              and
              <BalLink href="https://arbitrum.balancer.fi" external>
                Arbitrum </BalLink
              >.
            </template>
          </li>
        </ul>
      </div>
    </div>
    <div v-else class="px-3 pb-3 mt-4 text-sm">
      <div>{{ $t('liquidityMiningPopover.airdropEligibility') }}</div>
    </div>
  </div>
</template>
