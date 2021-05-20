<template>
  <BalPopover no-pad v-if="userClaims != null">
    <template v-slot:activator>
      <BalBtn
        color="gradient-pink-yellow"
        rounded
        class="mr-2 text-base hidden md:block"
        size="sm"
      >
        <StarsIcon class="mr-1" />{{ fNum(userClaims.totalRewards, 'token') }}
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
        <BalBtn color="gradient" size="md" block class="mb-1"
          >{{ $t('claim') }} BAL</BalBtn
        >
      </div>
      <div class="p-3">
        <div class="mb-1">{{ $t('pendingCurrentWeek') }}</div>
        <div class="flex justify-between items-center mb-2">
          <div class="text-lg font-bold">
            {{ fNum(userClaims.currentRewardsEstimate, 'token') }} BAL
          </div>
          <div>
            {{
              currentRewardsEstimateInUSD != null
                ? fNum(currentRewardsEstimateInUSD, 'usd')
                : '-'
            }}
          </div>
        </div>
      </div>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';

import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/composables/useWeb3';
import useUserClaimsQuery from '@/composables/queries/useUserClaimsQuery';

import { getOriginalAddress } from '@/services/coingecko';

import { TOKENS } from '@/constants/tokens';
import { bnum } from '@/lib/utils';

export default defineComponent({
  name: 'AppNavClaimBtn',

  setup() {
    // COMPOSABLES
    const store = useStore();
    const userClaimsQuery = useUserClaimsQuery();
    const { fNum } = useNumbers();
    const { appNetwork } = useWeb3();

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

    const currentRewardsEstimateInUSD = computed(() =>
      balPrice.value != null &&
      userClaims.value != null &&
      userClaims.value.currentRewardsEstimate != null
        ? bnum(userClaims.value?.currentRewardsEstimate)
            .times(balPrice.value)
            .toString()
        : null
    );

    return {
      // computed
      userClaims,
      availableToClaimInUSD,
      currentRewardsEstimateInUSD,

      // methods
      fNum
    };
  }
});
</script>
<style scoped></style>
