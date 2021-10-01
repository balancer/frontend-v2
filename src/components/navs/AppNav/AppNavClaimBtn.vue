<script setup lang="ts">
import { computed, ref, watch } from 'vue';
// import { differenceInSeconds } from 'date-fns';
// import { useIntervalFn } from '@vueuse/core';

import useNumbers from '@/composables/useNumbers';
import useUserClaimsQuery from '@/composables/queries/useUserClaimsQuery';
import useBreakpoints from '@/composables/useBreakpoints';

import { TOKENS } from '@/constants/tokens';
import { bnum } from '@/lib/utils';
import { claimService } from '@/services/claim/claim.service';
import useWeb3 from '@/services/web3/useWeb3';
import useEthers from '@/composables/useEthers';
import useTransactions from '@/composables/useTransactions';
import useTokens from '@/composables/useTokens';
// import { oneSecondInMs } from '@/composables/useTime';
import { getAddress } from '@ethersproject/address';
import BalLink from '@/components/_global/BalLink/BalLink.vue';
import { EXTERNAL_LINKS } from '@/constants/links';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const isClaiming = ref(false);

enum Tabs {
  CLAIMABLE = 'claimable',
  CURRENT_ESTIMATE = 'currentEstimate'
}

const tabs = [
  { value: Tabs.CLAIMABLE, label: t('liquidityMiningPopover.tabs.claimable') },
  {
    value: Tabs.CURRENT_ESTIMATE,
    label: t('liquidityMiningPopover.tabs.currentEstimate')
  }
];
const activeTab = ref(tabs[0].value);

// const rewardsEstimateSinceTimestamp = ref('0');

// COMPOSABLES
const { upToLargeBreakpoint } = useBreakpoints();
const userClaimsQuery = useUserClaimsQuery();
const { fNum } = useNumbers();
const {
  appNetworkConfig,
  account,
  getProvider,
  isPolygon,
  isMismatchedNetwork
} = useWeb3();
const { txListener } = useEthers();
const { addTransaction } = useTransactions();
const { priceFor, tokens } = useTokens();

type ClaimableToken = {
  token: string;
  symbol: string;
  amount: string;
  fiatValue: string;
  currentEstimateAmount: string;
  currentEstimateAmountFiatValue: string;
  totalFiatValue: string;
  totalAmount: string;
};

const BALTokenAddress = getAddress(TOKENS.AddressMap[appNetworkConfig.key].BAL);

// COMPUTED

const isAirdrop = computed(() => isPolygon.value);

const userClaims = computed(() =>
  userClaimsQuery.isSuccess.value ? userClaimsQuery.data?.value : null
);

const userClaimsLoading = computed(
  () => userClaimsQuery.isLoading.value || userClaimsQuery.isIdle.value
);

// having multiple unclaimed weeks may cause the browser to freeze (> 5)
const shouldShowClaimFreezeWarning = computed(() =>
  userClaims.value != null ? userClaims.value.pendingClaims.length > 5 : false
);

const claimableTokens = computed<ClaimableToken[]>(() => {
  if (userClaims.value != null) {
    return userClaims.value.pendingClaims.map(
      ({ availableToClaim, tokenClaimInfo }) => {
        let currentEstimateAmount = '0';

        if (userClaims.value?.multiTokenCurrentRewardsEstimate != null) {
          const currentEstimate =
            userClaims.value.multiTokenCurrentRewardsEstimate[
              tokenClaimInfo.token
            ];

          if (currentEstimate != null) {
            currentEstimateAmount = currentEstimate.rewards;
          }
        }

        const fiatValue = bnum(availableToClaim).times(
          priceFor(tokenClaimInfo.token)
        );

        const currentEstimateAmountFiatValue = bnum(
          currentEstimateAmount
        ).times(priceFor(tokenClaimInfo.token));

        const totalFiatValue = fiatValue.plus(currentEstimateAmountFiatValue);
        const totalAmount = bnum(availableToClaim).plus(currentEstimateAmount);

        return {
          token: tokenClaimInfo.token,
          symbol: tokens.value[tokenClaimInfo.token]?.symbol,
          amount: availableToClaim,
          fiatValue: fiatValue.toString(),
          currentEstimateAmount,
          currentEstimateAmountFiatValue: currentEstimateAmountFiatValue.toString(),
          totalFiatValue: totalFiatValue.toString(),
          totalAmount: totalAmount.toString()
        };
      }
    );
  }
  return [];
});

const claimableTokensWithPlaceholder = computed(() =>
  claimableTokens.value.length === 0
    ? [
        {
          token: BALTokenAddress,
          symbol: tokens.value[BALTokenAddress]?.symbol,
          amount: '0',
          fiatValue: '0',
          currentEstimateAmount: '0',
          currentEstimateAmountFiatValue: '0',
          totalFiatValue: '0',
          totalAmount: '0'
        }
      ]
    : claimableTokens.value
);

const totalRewardsFiatValue = computed(() =>
  claimableTokens.value
    .reduce(
      (totalValue, { totalFiatValue }) => totalValue.plus(totalFiatValue),
      bnum(0)
    )
    .toString()
);

const hasRewards = computed(() => claimableTokens.value.length > 0);
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
        userClaims.value.pendingClaims
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
        {{ $t('liquidityMiningPopover.airdrop', ['Polygon']) }}
      </div>
      <BalAlert
        v-if="shouldShowClaimFreezeWarning && !isAirdrop"
        :title="$t('liquidityMiningPopover.claimFreezeWarning.title')"
        :description="
          $t('liquidityMiningPopover.claimFreezeWarning.description')
        "
        type="warning"
        size="sm"
        class="mb-3"
      />
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
              v-for="claimableToken in claimableTokensWithPlaceholder"
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
              v-for="claimableToken in claimableTokensWithPlaceholder"
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
                    {{ fNum(claimableToken.currentEstimateAmount, 'token') }}
                    {{ claimableToken.symbol }}
                  </div>
                  <div class="font-sm text-gray-400">
                    {{
                      fNum(claimableToken.currentEstimateAmountFiatValue, 'usd')
                    }}
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
          :disabled="!hasRewards"
          >{{ $t('claimAll') }}
          <template v-if="hasRewards"
            >~{{ fNum(totalRewardsFiatValue, 'usd') }}</template
          ></BalBtn
        >
      </div>
      <div class="text-sm">
        <div v-if="!hasRewards">
          <div class="font-semibold mb-2">
            {{ $t('liquidityMiningPopover.noRewards.title') }}
          </div>
          <div>{{ $t('liquidityMiningPopover.noRewards.description') }}</div>
        </div>
        <div class="mb-2">
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
          <BalLink href="https://polygon.balancer.fi" external>
            Polygon
          </BalLink>
          and
          <BalLink href="https://arbitrum.balancer.fi" external
            >Arbitrum</BalLink
          >.
        </div>
      </div>
    </div>
  </BalPopover>
</template>
