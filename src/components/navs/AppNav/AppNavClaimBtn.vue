<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAddress } from 'ethers/lib/utils';
import { differenceInSeconds } from 'date-fns';
import { useIntervalFn } from '@vueuse/core';

import useNumbers from '@/composables/useNumbers';
import useUserClaimsQuery from '@/composables/queries/useUserClaimsQuery';
import useBreakpoints from '@/composables/useBreakpoints';
import useEthers from '@/composables/useEthers';
import useTransactions from '@/composables/useTransactions';
import useTokens from '@/composables/useTokens';
import { networkId } from '@/composables/useNetwork';
import { oneSecondInMs } from '@/composables/useTime';

import { bnum } from '@/lib/utils';

import { claimService } from '@/services/claim/claim.service';
import useWeb3 from '@/services/web3/useWeb3';

import BalLink from '@/components/_global/BalLink/BalLink.vue';

import { TOKENS } from '@/constants/tokens';
import useTranasactionErrors, {
  TransactionError
} from '@/composables/useTransactionErrors';

type ClaimableToken = {
  token: string;
  symbol: string;
  amount: string;
  fiatValue: string;
};

enum Tabs {
  CLAIMABLE = 'claimable',
  CURRENT_ESTIMATE = 'currentEstimate'
}

const { t } = useI18n();

const tabs = [
  { value: Tabs.CLAIMABLE, label: t('liquidityMiningPopover.tabs.claimable') },
  {
    value: Tabs.CURRENT_ESTIMATE,
    label: t('liquidityMiningPopover.tabs.currentEstimate')
  }
];

const activeTab = ref(tabs[0].value);
const isClaiming = ref(false);
const elapstedTimeSinceEstimateTimestamp = ref(0);
const claimError = ref<TransactionError | null>(null);

// COMPOSABLES
const { upToLargeBreakpoint } = useBreakpoints();
const userClaimsQuery = useUserClaimsQuery();
const { fNum2 } = useNumbers();
const {
  account,
  getProvider,
  isArbitrum,
  isMainnet,
  isKovan,
  isPolygon,
  isMismatchedNetwork
} = useWeb3();
const { txListener } = useEthers();
const { addTransaction } = useTransactions();
const {
  priceFor,
  tokens,
  priceQueryLoading,
  loading: tokensLoading
} = useTokens();
const { parseError } = useTranasactionErrors();

const BALTokenAddress = getAddress(TOKENS.AddressMap[networkId.value].BAL);

// COMPUTED
const BALTokenPlaceholder = computed<ClaimableToken>(() => ({
  token: BALTokenAddress,
  symbol: tokens.value[BALTokenAddress]?.symbol,
  amount: '0',
  fiatValue: '0'
}));

// Polygon used to be an airdrop, now its claimable - leaving it here in case new networks will need to be airdropped first.
const isAirdrop = false;

const legacyClaimUI = computed(() => {
  if (isMainnet.value || isKovan.value) {
    return [
      { token: '$BAL', subdomain: 'claim' },
      { token: '$VITA', subdomain: 'claim-vita' },
      { token: '$LDO', subdomain: 'claim-lido' }
    ];
  } else if (isArbitrum.value) {
    return [
      { token: '$BAL', subdomain: 'claim-arbitrum' },
      { token: '$MCDEX', subdomain: 'claim-mcdex' },
      { token: '$PICKLE', subdomain: 'claim-pickle' }
    ];
  }

  return [];
});

const userClaims = computed(() =>
  userClaimsQuery.isSuccess.value ? userClaimsQuery.data?.value : null
);

const userClaimsLoading = computed(
  () =>
    userClaimsQuery.isLoading.value ||
    userClaimsQuery.isIdle.value ||
    priceQueryLoading.value ||
    tokensLoading.value
);

const claimableTokens = computed<ClaimableToken[]>(() => {
  if (
    userClaims.value != null &&
    userClaims.value.multiTokenPendingClaims.length > 0
  ) {
    return userClaims.value.multiTokenPendingClaims.map(
      ({ availableToClaim, tokenClaimInfo }) => ({
        token: tokenClaimInfo.token,
        symbol: tokens.value[tokenClaimInfo.token]?.symbol,
        amount: availableToClaim,
        fiatValue: bnum(availableToClaim)
          .times(priceFor(tokenClaimInfo.token))
          .toString()
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
          symbol: tokens.value[token]?.symbol,
          amount: totalRewards.toString(),
          fiatValue: totalRewards.times(priceFor(token)).toString()
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

const totalCurrentEstimateClaimableTokensFiatValue = computed(() =>
  currentEstimateClaimableTokens.value
    .reduce((totalValue, { fiatValue }) => totalValue.plus(fiatValue), bnum(0))
    .toString()
);

const totalRewardsFiatValue = computed(() =>
  bnum(totalClaimableTokensFiatValue.value)
    .plus(totalCurrentEstimateClaimableTokensFiatValue.value)
    .toString()
);

const hasClaimableTokens = computed(() =>
  claimableTokens.value.some(
    claimableToken => Number(claimableToken.amount) > 0
  )
);

const hasCurrentEstimateClaimableTokens = computed(() =>
  currentEstimateClaimableTokens.value.some(
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
              maximumFractionDigits: 4
            })} ${claimableToken.symbol}`
        )
        .join(', ');

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'claim',
        summary
      });

      txListener(tx, {
        onTxConfirmed: () => {
          isClaiming.value = false;
          userClaimsQuery.refetch.value();
        },
        onTxFailed: () => {
          isClaiming.value = false;
        }
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
  <BalPopover no-pad>
    <template v-slot:activator>
      <BalBtn
        color="white"
        class="mr-2 text-base"
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        :circle="upToLargeBreakpoint"
      >
        <StarsIcon
          :class="{ 'mr-2': !upToLargeBreakpoint }"
          v-if="upToLargeBreakpoint ? !userClaimsLoading : true"
        />
        <BalLoadingIcon size="sm" v-if="userClaimsLoading" />
        <span class="hidden lg:block" v-else>{{
          fNum2(totalRewardsFiatValue, FNumFormats.fiat)
        }}</span>
      </BalBtn>
    </template>
    <div class="w-80 sm:w-96" v-if="userClaims != null">
      <h5 class="text-lg mb-3 px-3 pt-3">
        {{ $t('liquidityMiningPopover.title') }}
      </h5>
      <div class="text-sm text-gray-600 mb-1 px-3" v-if="isAirdrop">
        {{ $t('liquidityMiningPopover.airdropExplainer', ['Polygon']) }}
      </div>
      <div v-if="!isAirdrop" class="px-3">
        <BalCard no-pad class="mb-4">
          <template v-slot:header>
            <div
              class="w-full px-3 border-b dark:border-gray-900 bg-gray-50 dark:bg-gray-800"
            >
              <BalTabs
                v-model="activeTab"
                :tabs="tabs"
                class="whitespace-nowrap p-0 m-0"
                no-pad
              />
            </div>
          </template>
          <template v-if="activeTab === Tabs.CLAIMABLE">
            <template
              v-for="claimableToken in claimableTokens"
              :key="`token-${claimableToken.token}`"
            >
              <div
                class="px-3 py-2 flex items-center mb-2 border-b dark:border-gray-900 last:border-0"
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
                  <div class="font-sm text-gray-400">
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
                class="px-3 py-2 flex items-center mb-2 border-b dark:border-gray-900 last:border-0"
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
                  <div class="font-sm text-gray-400">
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
          :loading-label="$t('claiming')"
          @click="claimAvailableRewards"
          :disabled="!hasClaimableTokens"
          >{{ $t('claimAll') }}
          <template v-if="hasClaimableTokens"
            >~{{
              fNum2(totalClaimableTokensFiatValue, FNumFormats.fiat)
            }}</template
          ></BalBtn
        >
        <BalAlert
          v-if="claimError != null"
          class="mb-6 -mt-4"
          type="error"
          size="md"
          :title="claimError.title"
          :description="claimError.description"
          block
          action-label="Dismiss"
          @actionClick="claimError = null"
        />
      </div>
      <div v-if="!isAirdrop" class="text-sm">
        <div
          v-if="!hasClaimableTokens && !hasCurrentEstimateClaimableTokens"
          class="mb-4 px-3"
        >
          <div class="font-semibold mb-1">
            {{ $t('liquidityMiningPopover.noRewards.title') }}
          </div>
          <div>{{ $t('liquidityMiningPopover.noRewards.description') }}</div>
        </div>
        <div class="mb-4 px-3">
          <div class="font-semibold mb-2">
            Looking for other claimable tokens?
          </div>
          <ul class="pl-8 list-disc">
            <li class="mt-2" v-if="legacyClaimUI.length > 0">
              Claim
              <span class="inline-grid grid-flow-col gap-1">
                <BalLink
                  v-for="legacyClaim in legacyClaimUI"
                  :key="`token-${legacyClaim.token}`"
                  :href="
                    `https://${legacyClaim.subdomain}.balancer.fi/#/${account}`
                  "
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
                <BalLink href="https://polygon.balancer.fi" external
                  >Polygon</BalLink
                >.
              </template>
              <template v-else-if="isPolygon">
                <BalLink href="https://app.balancer.fi" external>
                  Ethereum
                </BalLink>
                and
                <BalLink href="https://arbitrum.balancer.fi" external
                  >Arbitrum</BalLink
                >.
              </template>
              <template v-else-if="isMainnet || isKovan">
                <BalLink href="https://polygon.balancer.fi" external>
                  Polygon
                </BalLink>
                and
                <BalLink href="https://arbitrum.balancer.fi" external
                  >Arbitrum</BalLink
                >.
              </template>
            </li>
          </ul>
        </div>
        <div class="pt-3 border-t p-3 border-gray-200 dark:border-gray-700">
          View this week's<router-link
            :to="{ name: 'liquidity-mining' }"
            class="text-blue-500 hover:underline"
          >
            liquidity mining incentives
          </router-link>
        </div>
      </div>
      <div v-else class="mt-4 text-sm px-3 pb-3">
        <div>{{ $t('liquidityMiningPopover.airdropEligibility') }}</div>
      </div>
    </div>
  </BalPopover>
</template>
