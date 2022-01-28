<script setup lang="ts">
import useLge from '@/beethovenx/lbp/composables/useLge';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';
import { FullPool } from '@/services/balancer/subgraph/types';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { computed } from 'vue';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';
import useNumbers from '@/composables/useNumbers';

type Props = {
  lge: GqlLge;
  pool: FullPool;
};

const props = defineProps<Props>();
const { appNetworkConfig } = useWeb3();
const { fNum } = useNumbers();

const {
  isBeforeStart,
  isAfterEnd,
  startDateTimeFormatted,
  endDateTimeFormatted,
  launchToken,
  collateralToken,
  poolLaunchToken,
  poolCollateralToken,
  collateralTokenPrice
} = useLge(props.lge, props.pool);

const fundsRaised = computed(
  () =>
    parseFloat(poolCollateralToken.value?.balance || '') -
    parseFloat(props.lge.collateralAmount)
);
const fundsRaisedValue = computed(
  () => fundsRaised.value * collateralTokenPrice.value
);
</script>

<template>
  <img :src="props.lge.bannerImageUrl" class="mt-8" />
  <p class="mt-8 whitespace-pre-line">
    {{ props.lge.description }}
  </p>
  <h3 class="mt-8 mb-4">Project Links</h3>
  <div class="flex items-center">
    <a :href="props.lge.websiteUrl" target="_blank" class="mr-4">
      <BalIcon name="globe" size="xl" />
    </a>
    <a
      v-if="props.lge.twitterUrl"
      :href="props.lge.twitterUrl"
      target="_blank"
      class="mr-4 -mt-1"
    >
      <img src="~@/beethovenx/assets/images/twitter.svg" class="w-8" />
    </a>
    <a
      v-if="props.lge.discordUrl"
      :href="props.lge.discordUrl"
      target="_blank"
      class="-mt-1 mr-4"
    >
      <img src="~@/beethovenx/assets/images/discord.svg" class="w-8" />
    </a>
    <a
      v-if="props.lge.mediumUrl"
      :href="props.lge.mediumUrl"
      target="_blank"
      class="-mt-1 mr-4"
    >
      <img src="~@/beethovenx/assets/images/medium.svg" class="w-8" />
    </a>
    <a
      v-if="props.lge.telegramUrl"
      :href="props.lge.telegramUrl"
      target="_blank"
      class="-mt-1 mr-4"
    >
      <img src="~@/beethovenx/assets/images/telegram.svg" class="w-8" />
    </a>
  </div>
  <div class="mt-4">
    Token Contract Address:
    <a
      :href="
        `${appNetworkConfig.explorer}/address/${props.lge.tokenContractAddress}`
      "
      target="_blank"
      class="text-green-500"
    >
      {{ props.lge.tokenContractAddress }}
    </a>
  </div>
  <div>
    Owner Address:
    <a
      :href="`${appNetworkConfig.explorer}/address/${props.lge.adminAddress}`"
      target="_blank"
      class="text-green-500"
    >
      {{ props.lge.adminAddress }}
    </a>
  </div>
  <div>
    LBP Address:
    <a
      :href="`${appNetworkConfig.explorer}/address/${props.lge.address}`"
      target="_blank"
      class="text-green-500"
    >
      {{ props.lge.address }}
    </a>
    <div class="mt-8 mb-4">
      <h3>LBP Details</h3>
    </div>
    <div class="lbp-review-row">
      <div>
        <div class="font-medium">Start Date & Time</div>
        <div>{{ props.lge.startDate }}</div>
      </div>
      <div>
        <div class="font-medium">End Date & Time</div>
        <div>{{ props.lge.endDate }}</div>
      </div>
    </div>
    <div class="lbp-review-row">
      <div>
        <div class="font-medium">Trading Fee</div>
        <div>{{ props.lge.swapFeePercentage }}%</div>
      </div>
      <div>
        <div class="font-medium">Platform Fee</div>
        <div>2%</div>
      </div>
    </div>
    <div class="lbp-review-row">
      <div v-if="launchToken">
        <div class="font-medium">Launch Token Initial Balance</div>
        <div class="items-center flex">
          <span class="mr-2">{{ props.lge.tokenAmount }}</span>
          <span class="mr-1">{{ launchToken.symbol }}</span>
          <BalAsset
            :address="launchToken.address"
            :iconURI="props.lge.tokenIconUrl"
          />
        </div>
      </div>
      <div v-if="collateralToken">
        <div class="font-medium">Collateral Token Initial Balance</div>
        <div class="items-center flex">
          <span class="mr-2">{{ props.lge.collateralAmount }}</span>
          <span class="mr-1">{{ collateralToken.symbol }}</span>
          <BalAsset :address="collateralToken.address" />
        </div>
      </div>
    </div>
    <div class="lbp-review-row">
      <div v-if="launchToken">
        <div class="font-medium">Start Weights</div>
        <div class="items-center flex">
          <span class="mr-1">{{ props.lge.tokenStartWeight }}%</span>
          <BalAsset
            :address="launchToken.address"
            :iconURI="props.lge.tokenIconUrl"
          />
          <span class="mx-2">/</span>
          <span class="mr-1">{{ props.lge.collateralStartWeight }}%</span>
          <BalAsset :address="collateralToken.address" />
        </div>
      </div>
      <div v-if="collateralToken">
        <div class="font-medium">End Weights</div>
        <div class="items-center flex">
          <span class="mr-1">{{ props.lge.tokenEndWeight }}%</span>
          <BalAsset
            :address="launchToken.address"
            :iconURI="props.lge.tokenIconUrl"
          />
          <span class="mx-2">/</span>
          <span class="mr-1">{{ props.lge.collateralEndWeight }}%</span>
          <BalAsset :address="collateralToken.address" />
        </div>
      </div>
    </div>
    <div class="lbp-review-row">
      <div v-if="launchToken">
        <div class="font-medium">Current Weights</div>
        <div class="items-center flex">
          <span class="mr-1">
            {{ fNum(poolLaunchToken?.weight || '0', 'percent_lg') }}
          </span>
          <BalAsset
            :address="launchToken.address"
            :iconURI="props.lge.tokenIconUrl"
          />
          <span class="mx-2">/</span>
          <span class="mr-1">
            {{ fNum(poolCollateralToken?.weight || '0', 'percent_lg') }}
          </span>
          <BalAsset :address="collateralToken.address" />
        </div>
      </div>
      <div>
        <div class="font-medium">Liquidity</div>
        <div>{{ fNum(props.pool.totalLiquidity, 'usd_lg') }}</div>
      </div>
    </div>
    <div class="lbp-review-row">
      <div>
        <div class="font-medium">Volume</div>
        <div>{{ fNum(props.pool.totalSwapVolume, 'usd_lg') }}</div>
      </div>
      <div>
        <div class="font-medium">Funds Raised</div>
        <div>{{ fNum(fundsRaised, 'usd') }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lbp-review-row {
  @apply grid grid-cols-2 md:grid-cols-2 gap-y-8 gap-x-4 mb-4;
}
</style>
