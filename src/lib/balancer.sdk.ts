import { configService } from '@/services/config/config.service';
import { ref } from 'vue';
import { isTestMode } from '@/plugins/modes';

const network = (() => {
  return '1';
})();

export const hasFetchedPoolsForSor = ref(false);

export async function fetchPoolsForSor() {
  if (hasFetchedPoolsForSor.value) return;

  console.time('fetchPoolsForSor');
  hasFetchedPoolsForSor.value = true;
  console.timeEnd('fetchPoolsForSor');
}

if (!isTestMode()) fetchPoolsForSor();
