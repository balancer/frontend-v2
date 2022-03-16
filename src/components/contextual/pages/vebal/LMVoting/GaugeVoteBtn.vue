<script setup lang="ts">
import { ref } from 'vue';
import GaugeVoteModal from './GaugeVoteModal.vue';

/**
 * STATE
 */
const showVoteModal = ref(false);
</script>

<template>
  <BalBtn
    color="blue"
    :outline="true"
    size="sm"
    flat
    block
    @click.stop="showVoteModal = true"
  >
    {{ $t('veBAL.liquidityMining.table.vote') }}
  </BalBtn>
  <teleport to="#modal">
    <GaugeVoteModal v-if="showVoteModal" @close="showVoteModal = false" />
  </teleport>
</template>
