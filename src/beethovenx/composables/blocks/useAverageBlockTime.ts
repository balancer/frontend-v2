import { computed } from 'vue';
import useAverageBlockTimeQuery from '@/beethovenx/composables/blocks/useAverageBlockTimeQuery';

const SECONDS_PER_DAY = 86400;

export default function useAverageBlockTime() {
  const averageBlockTimeQuery = useAverageBlockTimeQuery();

  const blocksPerSecond = computed(() => averageBlockTimeQuery.data.value || 1);
  const blocksPerMinute = computed(() => 60 / blocksPerSecond.value);
  const blocksPerHour = computed(() => (60 * 60) / blocksPerSecond.value);
  const blocksPerDay = computed(() => SECONDS_PER_DAY / blocksPerSecond.value);
  const blocksPerWeek = computed(
    () => (SECONDS_PER_DAY * 7) / blocksPerSecond.value
  );
  const blocksPerMonth = computed(
    () => (SECONDS_PER_DAY * 30) / blocksPerSecond.value
  );
  const blocksPerYear = computed(() => {
    return (SECONDS_PER_DAY * 365) / blocksPerSecond.value;
  });

  return {
    blocksPerSecond,
    blocksPerMinute,
    blocksPerHour,
    blocksPerDay,
    blocksPerWeek,
    blocksPerMonth,
    blocksPerYear
  };
}
