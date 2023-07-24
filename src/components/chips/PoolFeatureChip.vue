<script lang="ts" setup>
import { Protocol, protocolIconPaths } from '@/composables/useProtocols';
import { PoolFeature } from '@/types/pools';
import { useI18n } from 'vue-i18n';

type Props = {
  feature: PoolFeature;
  protocols: Protocol[];
};

const props = defineProps<Props>();

const iconURIs = props.protocols.map(protocol => protocolIconPaths[protocol]);

const hasIcons = props.protocols.length > 0;

const width = 20 + (iconURIs.length - 1) * 16;

const { t } = useI18n();

function getFeatureClasses() {
  switch (props.feature) {
    case PoolFeature.Boosted:
      return 'bg-gradient-to-tr from-yellow-500 to-pink-500 text-white';
    case PoolFeature.CLP:
      return 'bg-gradient-to-tr from-pink-300 to-yellow-200 text-black';
    default:
      return '';
  }
}

function getFeatureLabel(): string {
  switch (props.feature) {
    case PoolFeature.Boosted:
      return t('boosted');
    case PoolFeature.CLP:
      return 'CLP';
    default:
      return '';
  }
}
</script>

<template>
  <div
    data-testid="feature-chip"
    :class="[
      'flex relative items-center py-1 pr-1.5 pl-2 mr-1 max-h-10 rounded',
      getFeatureClasses(),
    ]"
  >
    <BalAssetSet
      v-if="hasIcons"
      :logoURIs="iconURIs"
      :width="width"
      :size="16"
      :ringSize="1"
    />
    <span class="text-xs font-semibold">{{ getFeatureLabel() }}</span>
  </div>
</template>
