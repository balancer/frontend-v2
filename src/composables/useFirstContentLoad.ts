const isFirstContentPainted = ref(false);
const isWeb3Loaded = ref(false);

/**
 * Controls when the first content (generic layout parts and so on) has been painted, meaning that we can start loading the heavy bundle parts (web3 and API related)
 */
export function useFirstContentLoad() {
  setTimeout(() => (isFirstContentPainted.value = true), 5000);
  return {
    isFirstContentPainted,
    isWeb3Loaded,
  };
}
