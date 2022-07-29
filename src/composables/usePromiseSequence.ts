import { ref } from 'vue';

export default function usePromiseSequence() {
  const promises = ref<Array<() => Promise<void>>>([]);
  const processing = ref(false);

  async function processAll(): Promise<void> {
    processing.value = true;
    for (let i = 0; i < promises.value.length; i++) {
      await promises.value[i]();
      promises.value.splice(i, 1);
    }
    processing.value = false;
  }

  return {
    promises,
    processing,
    processAll,
  };
}
