import { readonly, ref } from 'vue';

// globals
const tokenInAddress = ref('');
const tokenInAmount = ref('');
const tokenOutAddress = ref('');
const tokenOutAmount = ref('');

export function useTradeState() {
  function setTokenInAddress(address: string) {
    tokenInAddress.value = address;
  }
  function setTokenOutAddress(address: string) {
    tokenOutAddress.value = address;
  }

  function setTokenInAmount(amount: string) {
    tokenInAmount.value = amount;
  }
  function setTokenOutAmount(amount: string) {
    tokenOutAmount.value = amount;
  }

  return {
    tokenInAddress,
    tokenOutAddress,
    tokenInAmount,
    tokenOutAmount,

    setTokenInAddress,
    setTokenOutAddress,
    setTokenInAmount,
    setTokenOutAmount
  };
}
