import { reactive, toRefs } from 'vue';

// globals
const swapState = reactive({
  initialized: false,
  tokenInAddress: '',
  tokenOutAddress: '',
  tokenInAmount: '',
  tokenOutAmount: '',
});

function setInitialized(val: boolean) {
  swapState.initialized = val;
}

function setTokenInAddress(address: string) {
  swapState.tokenInAddress = address;
}
function setTokenOutAddress(address: string) {
  swapState.tokenOutAddress = address;
}

function setTokenInAmount(amount: string) {
  swapState.tokenInAmount = amount;
}
function setTokenOutAmount(amount: string) {
  swapState.tokenOutAmount = amount;
}

export function useSwapState() {
  return {
    // can't set to read only refs as these vars are used as
    // model values
    ...toRefs(swapState),
    setTokenInAddress,
    setTokenOutAddress,
    setTokenInAmount,
    setTokenOutAmount,
    setInitialized,
  };
}
