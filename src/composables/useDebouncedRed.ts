import { customRef, Ref } from 'vue';

// Taken from https://vuejs.org/api/reactivity-advanced.html#customref
export default function useDebouncedRef<T>(value: T, delay = 200): Ref<T> {
  let timeout: NodeJS.Timeout;
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      },
    };
  });
}
