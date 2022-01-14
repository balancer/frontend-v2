<script setup lang="ts">
import BalRangeInput from '@/components/_global/BalRangeInput/BalRangeInput.vue';
import BalTooltip from '@/components/_global/BalTooltip/BalTooltip.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import LbpTokenWeightRangeLabel from '@/beethovenx/lbp/components/LbpTokenWeightRangeLabel.vue';
import useLgeCreateState from '@/beethovenx/lbp/composables/useLgeCreateState';
import useTokens from '@/composables/useTokens';
import { computed } from 'vue';
import LbpPreviewChart from '@/beethovenx/lbp/components/LbpPreviewChart.vue';

const { data, lgeChartConfigValid } = useLgeCreateState();
const { tokens, getToken, dynamicDataLoaded, dynamicDataLoading } = useTokens();

const launchToken = computed(() => {
  return getToken(data.value.tokenContractAddress);
});

const collateralToken = computed(() => {
  return getToken(data.value.collateralTokenAddress);
});

function handleStartWeightChange() {
  data.value.collateralStartWeight = 100 - data.value.tokenStartWeight;
}

function handleEndWeightChange() {
  data.value.collateralEndWeight = 100 - data.value.tokenEndWeight;
}
</script>

<template>
  <div
    class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4 mb-8"
    v-if="!dynamicDataLoading && launchToken && collateralToken"
  >
    <div class="col">
      <div>Start Weights</div>
      <div class="flex mt-4 mb-1 mr-3">
        <div class="flex-1">
          <LbpTokenWeightRangeLabel
            :address="data.tokenContractAddress"
            :symbol="launchToken?.symbol || ''"
            :weight="data.tokenStartWeight / 100"
            :iconURI="data.tokenIconUrl"
          />
        </div>
        <LbpTokenWeightRangeLabel
          :address="data.collateralTokenAddress"
          :symbol="collateralToken?.symbol || ''"
          :weight="data.collateralStartWeight / 100"
        />
      </div>
      <div class="">
        <BalRangeInput
          class="w-full"
          v-model="data.tokenStartWeight"
          :max="99"
          :interval="1"
          :min="1"
          @update:modelValue="handleStartWeightChange"
        />
      </div>
    </div>
    <div>
      <div>
        End Weights
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="sm" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-html="abc" class="w-52" />
        </BalTooltip>
      </div>
      <div class="flex mt-4 mb-1 mr-3">
        <div class="flex-1">
          <LbpTokenWeightRangeLabel
            :address="data.tokenContractAddress"
            :symbol="launchToken?.symbol || ''"
            :weight="data.tokenEndWeight / 100"
            :iconURI="data.tokenIconUrl"
          />
        </div>
        <LbpTokenWeightRangeLabel
          :address="data.collateralTokenAddress"
          :symbol="collateralToken?.symbol || ''"
          :weight="data.collateralEndWeight / 100"
        />
      </div>
      <div class="">
        <BalRangeInput
          class="w-full"
          v-model="data.tokenEndWeight"
          :max="99"
          :interval="1"
          :min="1"
          @update:modelValue="handleEndWeightChange"
        />
      </div>
    </div>
  </div>
  <BalAlert
    v-if="lgeChartConfigValid !== true"
    :title="lgeChartConfigValid"
    class="w-full mb-8"
    type="error"
  />
  <LbpPreviewChart />
</template>
