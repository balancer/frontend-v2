<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAddress } from 'ethers/lib/utils';
// import { differenceInSeconds } from 'date-fns';
// import { useIntervalFn } from '@vueuse/core';

import useNumbers from '@/composables/useNumbers';
import useUserClaimsQuery from '@/composables/queries/useUserClaimsQuery';
import useBreakpoints from '@/composables/useBreakpoints';
import useEthers from '@/composables/useEthers';
import useTransactions from '@/composables/useTransactions';
import useTokens from '@/composables/useTokens';
import { networkId } from '@/composables/useNetwork';
// import { oneSecondInMs } from '@/composables/useTime';

import { bnum } from '@/lib/utils';

import { claimService } from '@/services/claim/claim.service';
import useWeb3 from '@/services/web3/useWeb3';

import BalLink from '@/components/_global/BalLink/BalLink.vue';

import { EXTERNAL_LINKS } from '@/constants/links';
import { TOKENS } from '@/constants/tokens';

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
// const rewardsEstimateSinceTimestamp = ref('0');

// COMPOSABLES
const { upToLargeBreakpoint } = useBreakpoints();
const userClaimsQuery = useUserClaimsQuery();
const { fNum } = useNumbers();
const {
  account,
  getProvider,
  isArbitrum,
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

const BALTokenAddress = getAddress(TOKENS.AddressMap[networkId.value].BAL);

// COMPUTED
const BALTokenPlaceholder = computed<ClaimableToken>(() => ({
  token: BALTokenAddress,
  symbol: tokens.value[BALTokenAddress]?.symbol,
  amount: '0',
  fiatValue: '0'
}));

const isAirdrop = computed(() => isPolygon.value);

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
      ({ token, rewards }) => ({
        token,
        symbol: tokens.value[token]?.symbol,
        amount: rewards,
        fiatValue: bnum(rewards)
          .times(priceFor(token))
          .toString()
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

/*
TODO: support "live" rewards

useIntervalFn(async () => {
  if (
    userClaims.value != null &&
    userClaims.value.currentRewardsEstimate != null
  ) {
    const diffInSeconds = differenceInSeconds(
      new Date(),
      new Date(userClaims.value.currentRewardsEstimate.timestamp)
    );
    rewardsEstimateSinceTimestamp.value = bnum(diffInSeconds)
      .times(userClaims.value.currentRewardsEstimate.velocity)
      .toString();
  }
}, oneSecondInMs);

watch(account, () => {
  rewardsEstimateSinceTimestamp.value = '0';
});
*/

watch(isMismatchedNetwork, () => {
  userClaimsQuery.refetch.value();
});

// METHODS
async function claimAvailableRewards() {
  if (userClaims.value != null) {
    isClaiming.value = true;
    try {
      const tx = await claimService.multiTokenClaimRewards(
        getProvider(),
        account.value,
        userClaims.value.multiTokenPendingClaims
      );

      const summary = claimableTokens.value
        .map(
          claimableToken =>
            `${fNum(claimableToken.amount, 'token_fixed')} ${
              claimableToken.symbol
            }`
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
          fNum(totalRewardsFiatValue, 'usd')
        }}</span>
      </BalBtn>
    </template>
    <div class="w-80 sm:w-96  p-3" v-if="userClaims != null">
      <h5 class="text-lg mb-3">{{ $t('liquidityMiningPopover.title') }}</h5>
      <div class="text-sm text-gray-600 mb-1" v-if="isAirdrop">
        {{ $t('liquidityMiningPopover.airdropExplainer', ['Polygon']) }}
      </div>
      <div v-if="!isAirdrop">
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
              :key="claimableToken.token"
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
                    {{ fNum(claimableToken.amount, 'token') }}
                    {{ claimableToken.symbol }}
                  </div>
                  <div class="font-sm text-gray-400">
                    {{ fNum(claimableToken.fiatValue, 'usd') }}
                  </div>
                </div>
              </div>
            </template>
          </template>
          <template v-if="activeTab === Tabs.CURRENT_ESTIMATE">
            <template
              v-for="claimableToken in currentEstimateClaimableTokens"
              :key="claimableToken.token"
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
                    {{ fNum(claimableToken.amount, 'token') }}
                    {{ claimableToken.symbol }}
                  </div>
                  <div class="font-sm text-gray-400">
                    {{ fNum(claimableToken.fiatValue, 'usd') }}
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
            >~{{ fNum(totalClaimableTokensFiatValue, 'usd') }}</template
          ></BalBtn
        >
      </div>
      <div v-if="!isAirdrop" class="text-sm">
        <div
          v-if="!hasClaimableTokens && !hasCurrentEstimateClaimableTokens"
          class="mb-4"
        >
          <div class="font-semibold mb-1">
            {{ $t('liquidityMiningPopover.noRewards.title') }}
          </div>
          <div>{{ $t('liquidityMiningPopover.noRewards.description') }}</div>
        </div>
        <div class="mb-1">
          <router-link
            :to="{ name: 'liquidity-mining' }"
            class="text-blue-500 hover:underline"
          >
            {{ $t('liquidityMiningPopover.viewLMLink') }}
          </router-link>
        </div>
        <div class="mb-4">
          <BalLink :href="EXTERNAL_LINKS.Balancer.Claim(account)" external>
            {{ $t('liquidityMiningPopover.viewLegacyClaimLink') }}
          </BalLink>
        </div>
        <div class="text-xs">
          <!-- TODO: translate with component interpolation -->
          Switch networks in the header to see your current cumulative BAL
          incentives on
          <template v-if="isArbitrum">
            <BalLink href="https://balancer.fi" external>
              Ethereum
            </BalLink>
            and
            <BalLink href="https://polygon.balancer.fi" external
              >Polygon</BalLink
            >.
          </template>
          <template v-else-if="isPolygon">
            <BalLink href="https://balancer.fi" external>
              Ethereum
            </BalLink>
            and
            <BalLink href="https://arbitrum.balancer.fi" external
              >Arbitrum</BalLink
            >.
          </template>
          <template v-else>
            <BalLink href="https://polygon.balancer.fi" external>
              Polygon
            </BalLink>
            and
            <BalLink href="https://arbitrum.balancer.fi" external
              >Arbitrum</BalLink
            >.
          </template>
        </div>
      </div>
      <div v-else class="mt-4 text-sm">
        <div>{{ $t('liquidityMiningPopover.airdropEligibility') }}</div>
      </div>
    </div>
  </BalPopover>
</template>
