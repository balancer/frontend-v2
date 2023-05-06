import { defineComponent } from 'vue';
import { useContentLoadStates } from './composables/useContentLoadStates';

export default defineComponent({
  setup() {
    const { isFirstContentPainted } = useContentLoadStates();
    onBeforeMount(async () => {
      // await import('@balancer-labs/sdk');
      const module = await import('./dependencies');
      module.initDependencies();
      isFirstContentPainted.value = true;
    });
  },
  render() {
    return '';
  },
});
