import { reactive, toRefs } from 'vue';

type LockState = {
  lockAmount: string;
  lockEndDate: string;
};

/**
 * STATE
 */
const state = reactive<LockState>({
  lockAmount: '',
  lockEndDate: '',
});

/**
 * METHODS
 */
function resetState(): void {
  state.lockAmount = '';
}

export default function useLockState() {
  return {
    ...toRefs(state),
    resetState,
  };
}
