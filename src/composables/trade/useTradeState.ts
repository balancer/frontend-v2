import { reactive, toRefs } from 'vue';

// globals
const tradeState = reactive({
  tokenInAddress: '',
  tokenOutAddress: '',
  tokenInAmount: '',
  tokenOutAmount: ''
});

export function useTradeState() {
  function setTokenInAddress(address: string) {
    tradeState.tokenInAddress = address;
  }
  function setTokenOutAddress(address: string) {
    tradeState.tokenOutAddress = address;
  }

  function setTokenInAmount(amount: string) {
    tradeState.tokenInAmount = amount;
  }
  function setTokenOutAmount(amount: string) {
    tradeState.tokenOutAmount = amount;
  }

  return {
    // can't set to read only refs as these vars are used as
    // model values
    ...toRefs(tradeState),
    setTokenInAddress,
    setTokenOutAddress,
    setTokenInAmount,
    setTokenOutAmount
  };
}
