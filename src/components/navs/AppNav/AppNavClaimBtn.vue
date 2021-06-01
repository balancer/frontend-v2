<template>
  <BalPopover no-pad v-if="userClaims != null">
    <template v-slot:activator>
      <BalBtn
        color="gradient-pink-yellow"
        rounded
        class="mr-2 text-base"
        :size="['sm', 'md', 'lg'].includes(bp) ? 'md' : 'sm'"
        :circle="['sm', 'md', 'lg'].includes(bp)"
      >
        <StarsIcon /><span class="ml-1 hidden lg:block"
          >{{ fNum(totalRewards, 'token_4_decimals') }} BAL</span
        >
      </BalBtn>
    </template>
    <div class="divide-y w-72">
      <div class="p-3">
        <h5 class="text-base mb-3">{{ $t('liquidityMining') }}</h5>
        <div class="mb-1">{{ $t('availableToClaim') }}</div>
        <div class="flex justify-between items-center mb-2">
          <div class="text-lg font-bold">
            {{ fNum(userClaims.availableToClaim, 'token_4_decimals') }} BAL
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
          :disabled="userClaims.availableToClaim == 0"
          >{{ $t('claim') }} BAL</BalBtn
        >
      </div>
      <div class="p-3" v-if="currentRewards != null">
        <div class="mb-1">{{ $t('pendingCurrentWeek') }}</div>
        <div class="flex justify-between items-center mb-2">
          <div class="text-lg font-bold">
            {{ fNum(currentRewards, 'token_4_decimals') }} BAL
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
      <div class="p-3" v-else>{{ $t('liquidityProviderCopy') }}</div>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { differenceInSeconds } from 'date-fns';
import { useIntervalFn } from '@vueuse/core';

import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/composables/useWeb3';
import useAuth from '@/composables/useAuth';
import useNotify from '@/composables/useNotify';
import useUserClaimsQuery from '@/composables/queries/useUserClaimsQuery';
import useBreakpoints from '@/composables/useBreakpoints';

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
    const { bp } = useBreakpoints();
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

    watch(account, () => {
      rewardsEstimateSinceTimestamp.value = '0';
    });

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
          txListener(tx.hash);

          await tx.wait();
          isClaiming.value = false;
          userClaimsQuery.refetch.value();
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
      bp,

      // methods
      fNum,
      claimAvailableRewards
    };
  }
});
</script>
