import { ref } from 'vue';

// STATE
const selectedTokens = ref<string[]>([]);

export default function usePoolFilters() {
  function setSelectedTokens(addresses: string[]): void {
    selectedTokens.value = addresses;
  }

  function addSelectedToken(address: string): void {
    selectedTokens.value.push(address);
  }

  function removeSelectedToken(address: string): void {
    const tokenIndex = selectedTokens.value.indexOf(address);
    selectedTokens.value.splice(tokenIndex, 1);
  }

  return {
    // state
    selectedTokens,
    // methods
    setSelectedTokens,
    addSelectedToken,
    removeSelectedToken,
  };
}
