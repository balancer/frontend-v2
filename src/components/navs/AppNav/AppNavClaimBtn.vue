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
        <span class="hidden lg:block font-numeric" v-else>{{
          fNum(totalRewards, totalRewards > 0 ? 'token_fixed' : 'token')
        }}</span>
      </BalBtn>
    </template>
    <div class="divide-y dark:divide-gray-900 w-72" v-if="userClaims != null">
      <div class="p-3">
        <h5 class="text-lg mb-3">{{ $t('liquidityMining') }}</h5>
        <div class="text-sm text-gray-600 mb-1" v-if="isPolygon">
          {{ $t('airdropExplainer') }}
        </div>
        <BalAlert
          v-if="shouldShowClaimFreezeWarning & isMainnet"
          title="Too many claims"
          :description="$t('claimFreezeWarning')"
          type="warning"
          size="sm"
          class="mb-3"
        />
        <div v-if="isMainnet" class="text-sm text-gray-600 mb-1">
          {{ $t('availableToClaim') }}
        </div>
        <div v-if="isMainnet" class="flex justify-between items-center mb-2">
          <div class="text-lg font-bold font-numeric">
            {{
              fNum(
                userClaims.availableToClaim,
                userClaims.availableToClaim > 0 ? 'token_fixed' : 'token'
              )
            }}
            BAL
          </div>
          <div class="font-numeric">
            {{
              availableToClaimInUSD != null
                ? fNum(availableToClaimInUSD, 'usd')
                : '-'
            }}
          </div>
        </div>
        <BalBtn
          v-if="isMainnet"
          color="gradient"
          size="md"
          block
          class="mb-1 "
          :loading="isClaiming"
          :loading-label="$t('claiming')"
          @click="claimAvailableRewards"
          :disabled="userClaims.availableToClaim == 0"
          >{{ $t('claim') }} BAL</BalBtn
        >
      </div>
      <div class="p-3" v-if="currentRewards != null">
        <div class="text-sm text-gray-600 mb-1">
          {{ $t('pendingEstimate') }}
        </div>
        <div class="flex justify-between items-center mb-2">
          <div class="text-lg font-bold font-numeric">
            {{
              fNum(currentRewards, currentRewards > 0 ? 'token_fixed' : 'token')
            }}
            BAL
          </div>
          <div class="font-numeric">
            {{
              currentRewardsInUSD != null
                ? fNum(currentRewardsInUSD, 'usd')
                : '-'
            }}
          </div>
        </div>
      </div>
      <div class="p-3 text-sm" v-else-if="totalRewards == 0">
        {{ $t('liquidityProviderCopy') }}
      </div>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { differenceInSeconds } from 'date-fns';
import { useIntervalFn } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

import useNumbers from '@/composables/useNumbers';
import useUserClaimsQuery from '@/composables/queries/useUserClaimsQuery';
import useBreakpoints from '@/composables/useBreakpoints';

import { TOKENS } from '@/constants/tokens';
import { bnum } from '@/lib/utils';
import { claimRewards } from '@/services/claim';
import useWeb3 from '@/services/web3/useWeb3';
import { NetworkId } from '@/constants/network';
import useEthers from '@/composables/useEthers';
import useTransactions from '@/composables/useTransactions';
import useTokens from '@/composables/useTokens';
import { coingeckoService } from '@/services/coingecko/coingecko.service';

export default defineComponent({
  name: 'AppNavClaimBtn',

  setup() {
    // DATA
    const isClaiming = ref(false);
    const rewardsEstimateSinceTimestamp = ref('0');

    // COMPOSABLES
    const { upToLargeBreakpoint } = useBreakpoints();
    const userClaimsQuery = useUserClaimsQuery();
    const { fNum } = useNumbers();
    const {
      appNetworkConfig,
      account,
      getProvider,
      isMainnet,
      isPolygon,
      isMismatchedNetwork
    } = useWeb3();
    const { txListener } = useEthers();
    const { addTransaction } = useTransactions();
    const { t } = useI18n();
    const { priceFor } = useTokens();

    const balPrice = computed(() =>
      priceFor(
        coingeckoService.prices.addressMapOut(
          TOKENS.AddressMap[appNetworkConfig.key].BAL
        )
      )
    );

    // COMPUTED
    const userClaims = computed(() =>
      userClaimsQuery.isSuccess.value ? userClaimsQuery.data?.value : null
    );

    const userClaimsLoading = computed(
      () => userClaimsQuery.isLoading.value || userClaimsQuery.isIdle.value
    );

    // having multiple unclaimed weeks may cause the browser to freeze (> 5)
    const shouldShowClaimFreezeWarning = computed(() =>
      userClaims.value != null
        ? userClaims.value.pendingClaims.length > 5
        : false
    );

    const availableToClaimInUSD = computed(() =>
      balPrice.value != null && userClaims.value != null
        ? bnum(userClaims.value?.availableToClaim)
            .times(balPrice.value)
            .toString()
        : null
    );

    const currentRewards = computed(() =>
      userClaims.value != null &&
      userClaims.value.currentRewardsEstimate != null
        ? bnum(userClaims.value.currentRewardsEstimate.rewards)
            .plus(rewardsEstimateSinceTimestamp.value)
            .toString()
        : null
    );

    const currentRewardsInUSD = computed(() =>
      balPrice.value != null && currentRewards.value != null
        ? bnum(currentRewards.value)
            .times(balPrice.value)
            .toString()
        : null
    );

    const totalRewards = computed(() =>
      userClaims.value != null
        ? bnum(userClaims.value.totalRewards)
            .plus(rewardsEstimateSinceTimestamp.value)
            .toString()
        : null
    );

    useIntervalFn(async () => {
      if (userClaims.value != null && userClaims.value.currentRewardsEstimate) {
        const diffInSeconds = differenceInSeconds(
          new Date(),
          new Date(userClaims.value.currentRewardsEstimate.timestamp)
        );
        rewardsEstimateSinceTimestamp.value = bnum(diffInSeconds)
          .times(userClaims.value.currentRewardsEstimate.velocity)
          .toString();
      }
    }, 1000);

    watch(account, () => {
      rewardsEstimateSinceTimestamp.value = '0';
    });

    watch(isMismatchedNetwork, () => {
      userClaimsQuery.refetch.value();
    });

    // METHODS
    async function claimAvailableRewards() {
      if (userClaims.value != null) {
        isClaiming.value = true;
        try {
          const tx = await claimRewards(
            appNetworkConfig.chainId as NetworkId,
            getProvider(),
            account.value,
            userClaims.value.pendingClaims,
            userClaims.value.pendingClaimsReports
          );

          addTransaction({
            id: tx.hash,
            type: 'tx',
            action: 'claim',
            summary: t('transactionSummary.claimBAL', [
              fNum(userClaims.value.availableToClaim, 'token_fixed')
            ])
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

    return {
      // data
      isClaiming,

      // computed
      isMainnet,
      isPolygon,
      userClaims,
      availableToClaimInUSD,
      currentRewards,
      currentRewardsInUSD,
      totalRewards,
      upToLargeBreakpoint,
      userClaimsLoading,
      shouldShowClaimFreezeWarning,

      // methods
      fNum,
      claimAvailableRewards
    };
  }
});
</script>
