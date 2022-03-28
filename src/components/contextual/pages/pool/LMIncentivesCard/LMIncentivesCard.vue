<script setup lang="ts">
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import { configService } from '@/services/config/config.service';
</script>

<template>
  <AnimatePresence isVisible>
    <div class="relative">
      <BalAccordion
        class="shadow-2xl"
        :sections="[
          {
            title: $t('liquidityMiningIncentives'),
            id: 'lm-incentives',
            handle: 'lm-handle'
          }
        ]"
      >
        <template v-slot:lm-handle>
          <button
            class="p-4 rounded-xl w-full hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <BalStack horizontal justify="between" align="center">
              <BalStack spacing="sm" align="center">
                <div
                  class="flex items-center p-1 text-white rounded-full bg-green-500"
                >
                  <BalIcon size="sm" name="check" />
                </div>
                <h6>{{ $t('liquidityMiningIncentives') }}</h6>
              </BalStack>
              <BalStack horizontal spacing="sm" align="center">
                <BalIcon name="chevron-down" class="text-blue-500" />
              </BalStack>
            </BalStack>
          </button>
        </template>
        <template v-slot:lm-incentives>
          <div class="p-4">
            <p>
              {{
                $t('liquidityMiningIncentivesCopy', [
                  configService.network.shortName
                ])
              }}
            </p>
          </div>
        </template>
      </BalAccordion>
    </div>
  </AnimatePresence>
</template>
