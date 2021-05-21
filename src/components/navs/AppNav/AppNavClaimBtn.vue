<template>
  <BalPopover no-pad v-if="userClaims != null">
    <template v-slot:activator>
      <BalBtn
        color="gradient-pink-yellow"
        rounded
        class="mr-2 text-base hidden md:block"
        size="sm"
      >
        <StarsIcon class="mr-1" />{{ fNum(totalRewards, 'token') }}
        BAL
      </BalBtn>
    </template>
    <div class="divide-y w-72">
      <div class="p-3">
        <h5 class="text-base mb-3">{{ $t('liquidityMining') }}</h5>
        <div class="mb-1">{{ $t('availableToClaim') }}</div>
        <div class="flex justify-between items-center mb-2">
          <div class="text-lg font-bold">
            {{ fNum(userClaims.availableToClaim, 'token') }} BAL
          </div>
          <div>
            {{
              availableToClaimInUSD != null
                ? fNum(availableToClaimInUSD, 'usd')
                : '-'
            }}
          </div>
        </div>
        <BalBtn
          color="gradient"
          size="md"
          block
          class="mb-1"
          :loading="isClaiming"
          :loading-label="$t('claiming')"
          @click="claimAvailableRewards"
          >{{ $t('claim') }} BAL</BalBtn
        >
      </div>
      <div class="p-3">
        <div class="mb-1">{{ $t('pendingCurrentWeek') }}</div>
        <div class="flex justify-between items-center mb-2">
          <div class="text-lg font-bold">
            {{ fNum(currentRewards, 'token') }} BAL
          </div>
          <div>
            {{
              currentRewardsInUSD != null
                ? fNum(currentRewardsInUSD, 'usd')
                : '-'
            }}
          </div>
        </div>
      </div>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useStore } from 'vuex';
import { differenceInSeconds } from 'date-fns';
import { useIntervalFn } from '@vueuse/core';

import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/composables/useWeb3';
import useAuth from '@/composables/useAuth';
import useNotify from '@/composables/useNotify';
import useUserClaimsQuery from '@/composables/queries/useUserClaimsQuery';

import { getOriginalAddress } from '@/services/coingecko';

import { TOKENS } from '@/constants/tokens';
import { bnum } from '@/lib/utils';
import { claimRewards } from '@/services/claim';

export default defineComponent({
  name: 'AppNavClaimBtn',

  setup() {
    // DATA

    const isClaiming = ref(false);
    const rewardsEstimateSinceTimestamp = ref('0');

    // COMPOSABLES
    const store = useStore();
    const userClaimsQuery = useUserClaimsQuery();
    const { fNum } = useNumbers();
    const { appNetwork, account } = useWeb3();
    const { txListener } = useNotify();
    const auth = useAuth();

    const balPrice = computed(
      () =>
        store.state.market.prices[
          getOriginalAddress(appNetwork.id, TOKENS.AddressMap.BAL)
        ]?.price
    );

    // COMPUTED
    const userClaims = computed(() =>
      userClaimsQuery.isSuccess.value ? userClaimsQuery.data?.value : null
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

    // METHODS
    async function claimAvailableRewards() {
      if (userClaims.value != null) {
        isClaiming.value = true;
        try {
          const tx = await claimRewards(
            appNetwork.id,
            auth.web3,
            account.value,
            userClaims.value.pendingClaims,
            userClaims.value.pendingClaimsReports
          );

          txListener(tx.hash, {
            onTxConfirmed: () => {
              isClaiming.value = false;
              userClaimsQuery.refetch.value();
            },
            onTxCancel: () => {
              isClaiming.value = false;
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
      userClaims,
      availableToClaimInUSD,
      currentRewards,
      currentRewardsInUSD,
      totalRewards,

      // methods
      fNum,
      claimAvailableRewards
    };
  }
});
</script>
