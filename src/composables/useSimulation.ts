import { tenderlyService } from '@/services/tenderly/tenderly.service';
import { ref } from 'vue';

/**
 * STATE
 */
const isSimulation = ref(false);

/**
 * METHODS
 */
function createSimulation() {
  tenderlyService.fork.create();
}

export default function useSimulation() {
  return {
    isSimulation,
    createSimulation,
    simulationAvailable: tenderlyService.available
  };
}
